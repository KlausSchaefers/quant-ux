import Analytics from "./Analytics";
import { UMAP } from 'umap-js';
import Prando from 'prando';
import DBScan from './DBScan';
import LOF from './LOF';
import Optics from './Optics';
import * as Distance from './Distance';
import Logger from '../core/Logger'


export function computeOutliersCluster (df) {
    const scores = getGraphSessionScores(df, false, true)

    const matrix = Object.values(scores).map(v => [v])
    const minDistance = getQuantile(Object.values(scores))
    const cluster = optics(matrix, minDistance)
    const outliers = clusterToDict(Object.keys(scores), cluster)
    return outliers
}

function clusterToDict(keys, cluster) {
    const result = {}
    for (let i=0; i < keys.length; i++) {
        result[keys[i]] = cluster[i] === -1 ? 1 : 0
    }
    return result
}

export function computeOutliersIRQ(df) {
    const weirdness = getGraphSessionScores(df, true, false)
    let weirdnessOutlier = getIRQOutlier(weirdness, .75)
    return weirdnessOutlier
}

export function computeOutliersMAD(df, f= 2) {
    // this seem to work will with normalizing the 
    const weirdness = getGraphSessionScores(df, true, true)
    let weirdnessOutlier = getMADOutlier(weirdness, f)
    return weirdnessOutlier
}

export function addWeirdness (sessionDetailsDF, eventsDF) {
    const weirdness = getGraphSessionScores(eventsDF, true, false)
    sessionDetailsDF.foreach((session) => {
        session.outlierWeirdness = false
        if (weirdness[session.session]) {
            session.weirdness = weirdness[session.session]
            if (weirdness[session.session] === 1) {
                session.outlierWeirdness = true
            }
        } else {
            session.weirdness = 0
        }
    })
    return sessionDetailsDF
}

export function cluster(data, cols = ["interactions", "duration", "screenLoads", "tasks"], normalize='minmax', method='optics', clusterSensitivity = 0.2) {
    Logger.log(-1, 'Outlier.cluster() > ' + method + ' > ' + normalize + ' > ' + clusterSensitivity,cols)

    if (cols.length === 0) {
       return {}
    }

    let matrix = getMatrix(data, cols)
    if (normalize ==='zScore') {
        matrix = getZScore(matrix)
    } else {
        matrix = getMinMaxScore(matrix)
    }

    const distance = getPairwiseDistance(matrix)
    const minDistance = getClusterMinDistance(distance, clusterSensitivity)
    const minNeighbour = getMinNeighbour(data)

    if (method === 'dbscan') {
        return dbscan(matrix, minDistance, minNeighbour)
    } else {
        return optics(matrix, minDistance, minNeighbour)
    }

}

export function getMinNeighbour() {
    return 2
}

export function getBaseData(events, tasks) {
    const analytics = new Analytics()
    const sessions = analytics.getSessionDetails(events, tasks)
    return analytics.convertSessionDetails(sessions)
}

export function getMatrix(sessions, columns) {
    const matrix = sessions.map(session => {
        const row = []
        columns.forEach(col => {
            row.push(session[col])
        });
        return row
    })
    return matrix
}

/**
 * Calculated the z-Score column wise.
 * 
 * https://en.wikipedia.org/wiki/Standard_score
 */
export function getZScore(matrix) {

    const cols = matrix[0].length;
    const rows = matrix.length
    const result = []
    for (let row = 0; row < rows; row++) {
        result.push([])
    }

    /**
     * For each column
     */
    for (let col = 0; col < cols; col++) {
        /**
         * calculate mean, variance and standard deviation
         */
        let sum = 0
        let variance = 0
        for (let row = 0; row < rows; row++) {
            const v = matrix[row][col]
            sum += v
        }
        const mean = sum / rows
        for (let row = 0; row < rows; row++) {
            const value = matrix[row][col]
            const dif = mean - value;
            variance += (dif * dif);
        }
        const std = Math.sqrt(variance)

        // calculate z-score
        for (let row = 0; row < rows; row++) {
            if (std === 0) {
                result[row][col] = 0
            } else {
                const x = matrix[row][col]
                const z = (x - mean) / std
                result[row][col] = z
            }
        }
    }
    return result
}


export function getRankScore(matrix) {

    const cols = matrix[0].length;
    const rows = matrix.length
    const result = []
    for (let row = 0; row < rows; row++) {
        result.push([])
    }

    /**
     * For each column
     */
    for (let col = 0; col < cols; col++) {
        let list = []
        for (let row = 0; row < rows; row++) {
            const v = matrix[row][col]
            list.push({
                row: row,
                value: v
            })
        }

        list.sort((a, b) => {
            return a.value - b.value
        })

        // calculate score
        let x = 0
        let lastValue = undefined
        for (let row = 0; row < rows; row++) {
            const rank = list[row]
            if (rank.value !== lastValue && lastValue !== undefined) {
                x++
            }
            result[rank.row][col] = x
            lastValue = rank.value
        }

    }
    return result
}



export function getPairwiseDistance(matrix, distanceFunction = Distance.l2) {
    const result = []
    const length = matrix.length;
    for (let row = 0; row < length; row++) {
        result.push([])
    }

    for (let current = 0; current < length; current++) {
        for (let other = current; other < length; other++) {
            let distance = 0
            if (current !== other) {
                const a = matrix[current]
                const b = matrix[other]
                distance = distanceFunction(a, b)
            }
            result[current][other] = distance
            result[other][current] = distance
        }
    }

    return result
}


export function umap(distance, neighborsFactor = 0.9, minDist = 0.1) {
    const umap = new UMAP({
        random: getRandom(distance),
        nComponents: 2,
        minDist: minDist,
        nEpochs: 400,
        nNeighbors: Math.floor(distance.length * neighborsFactor),
    });
    return umap.fit(distance);
}

export function getRandom(distance) {
    const prando = new Prando(distance.length);
    const random = () => prando.next();
    return random
}


export function getMinMaxScore(matrix, f = 1) {
    const cols = matrix[0].length;
    const rows = matrix.length
    const result = []
    for (let row = 0; row < rows; row++) {
        result.push([])
    }

    /**
     * For each column
     */
    for (let col = 0; col < cols; col++) {
        /**
         * calculate mean, variance and standard deviation
         */
        let min = 10000000
        let max = -10000000
        for (let row = 0; row < rows; row++) {
            const v = matrix[row][col]
            max = Math.max(max, v)
            min = Math.min(min, v)
        }
        const dif = max - min

        // calculate score
        for (let row = 0; row < rows; row++) {
            const x = matrix[row][col]
            result[row][col] = ((x - min) / dif) * f
        }

    }
    return result
}

export function getClusterMinDistance(distances, percentile = 0.2) {
    // FIXME: take a look here https://www.datanovia.com/en/lessons/dbscan-density-based-clustering-essentials/
    Logger.log(1, 'Outlier.getClusterMinDistance() > ', percentile)
    const flat = distances.flatMap(x => x)
    const sorted = flat.sort((a, b) => a - b)
    const max = flat.reduce((a,v) => Math.max(a,v))
    const sum = flat.reduce((a,v) => a + v)
    const mean = sum / flat.length
    const q = sorted[Math.floor(sorted.length * percentile)]

    Logger.log(1, 'Outlier.getClusterMinDistance() > ',[ max, max * percentile, mean, mean * percentile, q])
    
    return q
}

export function lof(matrix, epsilon = 0.5, minPts = 2) {
    Logger.log(1, 'Outlier.LOF() > ',[epsilon, minPts])
    const lof = new LOF(epsilon, minPts)
    const result = lof.run(matrix)
    return result.map(x => x * -1)
}


export function dbscan(matrix, epsilon = 1, minPts = 2) {
    Logger.log(1, 'Outlier.dbscan() > ',[epsilon, minPts])
    const dbscan = new DBScan(epsilon, minPts)
    const clusters = dbscan.run(matrix)
    return flattenClusters(matrix, clusters)
}

export function optics(matrix, epsilon = 1, minPts = 2) {
    Logger.log(1, 'Outlier.optics() > ',[epsilon, minPts])
    const optics = new Optics(epsilon, minPts)
    const clusters = optics.run(matrix)
    return flattenClusters(matrix, clusters)
}


export function flattenClusters(matrix, clusters){
    const result = []
    matrix.forEach((row, i) => {
        result[i] = -1
    })
    // we do not want to return all outliers
    if (clusters.length === 0) {
        matrix.forEach((row, i) => {
            result[i] = 0
        })
        return result
    }
    clusters.forEach((cluster, i) => {
        cluster.forEach(sessionID => {
            result[sessionID] = i
        })
    })


    return result
}

/**
 * https://www.analyticsvidhya.com/blog/2022/10/outliers-detection-using-iqr-z-score-lof-and-dbscan/
 */
export function getIRQOutlier (scores, f = 1.5, includeMin = false) {
    const values = Object.values(scores)
    const q1 = getQuantile(values, 0.25)
    const q3 = getQuantile(values, 0.75)
    const irq = q3-q1
    // FIXME: could we make this adaptive to some range?
    const min = q1 - (f * irq)
    const max = q3 + (f * irq)

    const result = {}
    Object.keys(scores).forEach((key) => {
        const v = scores[key]
        if (includeMin) {
            result[key] = (v <= min || v >= max) ? 1 : 0
        } else {
            result[key] = (v >= max) ? 1 : 0 
        }
       
    })
    Logger.log(2, 'Outlier.getIRQOutlier() > ' , values)
    Logger.log(2, 'Outlier.getIRQOutlier() > ' + f, [q1, q3, min, max])
    return result
}

/**
 * https://en.wikipedia.org/wiki/Median_absolute_deviation
 * https://dipot.ulb.ac.be/dspace/bitstream/2013/139499/1/Leys_MAD_final-libre.pdf
 */
export function getMADOutlier(scores, f=2) {
    const values = Object.values(scores)
    const median = getQuantile(values, 0.5)
    const mad = values.map(v => Math.abs(v - median))
    const medianMAD = getQuantile(mad, 0.5)
    const threshold = medianMAD * f
    let result = {}
    for (let key in scores) {
        const x = scores[key]
        if ((x - median) > threshold) {
          result[key] = 1  
        } else {
            result[key] = 0
        }
    }
    Logger.log(2, 'Outlier.getMADOutlier() > ' , values)
    Logger.log(2, 'Outlier.getMADOutlier() > ' , mad)
    Logger.log(2, 'Outlier.getMADOutlier() > ' + f, [median, medianMAD, threshold])
    return result
}



export function getGraphSessionScores(df, minMaxScores = true, normalizeRawScores = false) {
    const scores = getGraphSessionCounts(df, normalizeRawScores)
    return normalizeGraphScores(scores, minMaxScores)
}

export function getGraphSessionCounts(df, normalizeRawScores = false) {
    const encoded = encodeSessions(df)
    return computeRawGraphScores(encoded, normalizeRawScores)
}

export function computeRawGraphScores(encoded, normalizeRawScores = false) {
    Logger.log(-2, 'Outlier.computeRawGraphScores() > ' , normalizeRawScores)
    const counts = new CountDoubkeKeySet()
    Object.values(encoded).forEach(session => {
        for (let i = 0; i < session.length-1; i++) {
            const current = session[i]
            const next = session[i+1]
            counts.count(current, next)
        }
    })
  
    const scores = {}
 
    Object.keys(encoded).forEach(sessionId => {
        const session = encoded[sessionId]
        const seen = new Set()
        let sum = 0
        for (let i = 0; i < session.length-1; i++) {
            const current = session[i]
            const next = session[i+1]
            const key = current + '->' + next
            if (!seen.has(key)) {
                sum += counts.get(current, next)
            } else {
                //sum -= counts.get(current, next)
            }
            seen.add(key)
        }
        //sum = Math.max(session.length, sum)
        if (normalizeRawScores) {
            scores[sessionId] = sum / session.length
        } else {
            scores[sessionId] = sum
        }
    })
    return scores
}

export function normalizeGraphScores (scores, normalize=true) {
    let maxSum = Number.MIN_VALUE
    let minSum = Number.MAX_VALUE

    for (let key in scores) {
        const value = scores[key]
        maxSum = Math.max(maxSum, value)
        minSum = Math.min(minSum, value)
    }

    const dif = maxSum - minSum

    if (normalize) {
        for (let key in scores) {
            const x = scores[key]
            // scale between 0 & 1
            const scalled = (x - minSum )/ dif
            // flip because the lower values are the most weird ones
            const flipped = Math.max(0, -1 *(scalled-1))
            scores[key] = flipped
        }
    } else {
        for (let key in scores) {
            const x = scores[key]
            const flipped = Math.max(0, -1 *(x - maxSum))
            scores[key] = flipped
        }
    }
    Logger.log(2, 'Outlier.normalizeGraphScores() > ' + normalize, [minSum, maxSum] )
    return scores
}


export function getEditDistanceOutliers(df, f = .5) {
    const scores = getEditDistanceSessionScores(df)
    return getIRQOutlier(scores, f)
}

export function getEditDistanceSessionScores (df) {
    const encoded = encodeSessions(df)
    const matrix = Object.values(encoded)
    const distance = getPairwiseDistance(matrix, editDistance)
    const sessionDistanceSum = distance.map(row => {
        let sum = 0
        for (let i = 0; i < row.length; i++) {
            sum += row[i]
        }
        return sum
    })
    const result = {}
    Object.keys(encoded).forEach((key, i) => {
        const v = sessionDistanceSum[i]
        result[key] = v
    })
    return result
}

export function encodeSessions(df, allowedEvents = new Set(['ScreenClick', 'WidgetClick', 'ScreenLoaded', 'WidgetChange', 'OverlayLoaded'])) {
    const encoding = new EventEncoding()
    const result = {}
    const sessionGroup = df.groupBy("session");
    sessionGroup.foreach((session, id) => {
        session.sortBy("time");
        const row = []
        session.foreach(event => {
            if (allowedEvents.has(event.type)) {
                row.push(getEventKey(event, encoding))
            }

        })
        result[id] = row
    })
    return result
}

export function getEventKey(event, encoding) {
    const key = `${event.screen}.${event.widget}.${event.type}`
    return encoding.get(key)
}

export function editDistance(events1, events2) {
    const track = Array(events2.length + 1).fill(null).map(() =>
        Array(events1.length + 1).fill(null)
    );
    for (let i = 0; i <= events1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= events2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= events2.length; j += 1) {
        for (let i = 1; i <= events1.length; i += 1) {
            const k = events1[i - 1] === events2[j - 1] ? 0 : 1
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + k
            );
        }
    }
    return track[events2.length][events1.length];
}


class EventEncoding {
    constructor() {
        this.codes = {}
        this.count = 1
    }

    get(key) {
        if (!this.codes[key]) {
            this.codes[key] = this.count
            this.count++
        }
        return this.codes[key]
    }
}

class CountDoubkeKeySet {

    constructor () {
        this.value = {}
    }

    count(a, b) {
        if (!this.value[a]) {
            this.value[a] = {}
        }
        if (!this.value[a][b]) {
            this.value[a][b] = 0
        }
        this.value[a][b]++
    }

    get(a,b) {
        if (this.value[a] && this.value[a][b]) {
            return this.value[a][b]
        }
        return 0
    }
}


export function normCDF (x, mean, std) {
   
    x = (x - mean) / std
    let t = 1 / (1 + .2315419 * Math.abs(x))
    let d =.3989423 * Math.exp( -x * x / 2)
    let prob = d * t * (.3193815 + t * ( -.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    if( x > 0 ) prob = 1 - prob
    return prob

 }

 export function getOutlierByQuantile(scores, q = 0.1){
    const q1 = getQuantile(Object.values(scores), q)
    const result = {}
    Object.keys(scores).forEach((key) => {
        const v = scores[key]
        result[key] = v < q1 ? 1 : 0
    })
    Logger.log(2, 'Outlier.getOutlierByQuantile() > ', q1)
    return result
}

export function getQuantile(values, q = 0.5) {
    const sorted = values.sort((a,b) => a - b)
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
}

