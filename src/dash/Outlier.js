import Analytics from "./Analytics";
import tSNE from './TSNE'
import { UMAP } from 'umap-js';
import Prando from 'prando';
import DBScan from './DBScan';

export function getBaseData (events, tasks) {
    const analytics = new Analytics()

    const sessions = analytics.getSessionDetails(events, tasks)
    return sessions.data.map(r => {
        const result = {}
        for (let key in r) {
            if (key !== 'start') {
                const value = r[key]
                if (value.name) {
                    result[key] = value.success
                } else {
                    result[key] = value
                }
            }
        }
        return result
    })
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


export function gerRankScore(matrix) {

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



export function getPairwiseDistance(matrix, distanceFunction = l2) {
    const result = []
    const length = matrix.length;
    // FIXME: Speed this up and calculate one triangle matrix
    for (let current = 0; current < length; current++) {
        let distances = []
        for (let other = 0; other < length; other++) {
            if (current !== other) {
                const a = matrix[current]
                const b = matrix[other]
                distances.push(distanceFunction(a, b))
            } else {
                distances.push(1)
            }
        }
        result.push(distances)
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

export function tsne(distance, perplexity = 30, epsilon =10 ) {

    const tsne = new tSNE({
        //random: getRandom(distance),
        epsilon: perplexity,
        perplexity: epsilon,
        dim: 2
    });
    tsne.initDataDist(distance);
    for (var k = 0; k < 500; k++) {
        tsne.step(); 
    }
    return tsne.getSolution();
}

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
        let min = 1000000
        let max = 0
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
