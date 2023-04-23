import Analytics from "./Analytics";
import tSNE from './TSNE'

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



export function getPairwiseDistance(matrix, distanceFunction = l2) {
    const result = []
    const length = matrix.length;
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

export function project2D(distance, perplexity = 30, epsilon =10 ) {

    const tsne = new tSNE({
        epsilon: perplexity,
        perplexity: epsilon,
        dim: 2
    });
    tsne.initDataDist(distance);
    for (var k = 0; k < 5000; k++) {
        tsne.step(); 
    }
    return tsne.getSolution();
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

