import Analytics from "./Analytics";
import { UMAP } from 'umap-js';
import Prando from 'prando';
import DBScan from './DBScan';

export function getBaseData (events, tasks) {
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
            const x = matrix[row][col]
            const z = (x - mean) / std
            result[row][col] = z
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



export function getPairwiseDistance(matrix, distanceFunction = l2) {
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

export function l2 (a, b) {
    const length = a.length;
    let d = 0;
    for (let i = 0; i < length; i++) {
        const x1i = a[i];
        const x2i = b[i];
        d += (x1i - x2i) * (x1i - x2i);
    }
    return Math.sqrt(d);
}

// export function tsne(distance, perplexity = 30, epsilon =10 ) {

//     const tsne = new tSNE({
//         //random: getRandom(distance),
//         epsilon: perplexity,
//         perplexity: epsilon,
//         dim: 2
//     });
//     tsne.initDataDist(distance);
//     for (var k = 0; k < 500; k++) {
//         tsne.step(); 
//     }
//     return tsne.getSolution();
// }

export function umap(distance, neighborsFactor = 0.9, minDist=0.1) {   
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
            result[row][col] = ((x -  min) / dif) * f
        }
        
    }    
    return result
}

export function getClusterMinDistance(distances, percentile = 0.2) {
    const values = distances.flatMap(x =>x).sort((a,b) => a-b)
    return values[Math.floor(values.length * percentile)]
}

export function cluster(matrix, epsilon = 1, minPts = 2) {
    const dbscan = new DBScan(epsilon, minPts)
    const clusters = dbscan.run(matrix)
    const result = {}
    matrix.forEach((row, i) => {
        result[i] = -1
    })
    clusters.forEach((cluster, i) => {
        cluster.forEach(sessionID => {
            result[sessionID] = i
        })
    })
    return result
}


export function getWeirdness(df) {
    const encoded = encodeSessions(df)
    const matrix = Object.values(encoded)
    const distance = getPairwiseDistance(matrix, editDistance)
    const sessionDistanceSum = distance.map(row => {
        let sum = 0
        for (let i=0; i < row.length; i++) {
            sum += row[i]
        }
        return [sum]
    })

    const minMaxScore = getMinMaxScore(sessionDistanceSum)


    const result = {}
    Object.keys(encoded).forEach((key, i) => {
        result[key] = minMaxScore[i][0]
    })
    return result

}

export function encodeSessions(df, allowedEvents = new Set(['ScreenClick', 'WidgetClick', 'ScreenLoaded', 'WidgetChange', 'OverlayLoaded'])) {
    const encoding = new EventEncoding()
    const result = {}

    const sessionGroup = df.groupBy("session");
    sessionGroup.foreach((session, id)  => {
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

class EventEncoding {
    constructor () {
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

export function editDistance (events1 , events2) {
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
          const k = events1[i - 1] === events2[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
             track[j][i - 1] + 1,
             track[j - 1][i] + 1,
             track[j - 1][i - 1] + k
          );
       }
    }
    return track[events2.length][events1.length];
 };