// based on https://github.com/chen0040/java-local-outlier-factor/blob/master/src/main/java/com/github/chen0040/lof/LOF.java

import * as Distance from './Distance'

export default class LOF {


    constructor (threshold = 0.5, minPtsLB = 2, distanceFunction = Distance.l2){
        this.threshold = threshold;
        this.minPtsLB = minPtsLB
        this.minPtsUB = 10
        this.minScore = 0
        this.maxScore = 0
        this.distanceFunction = distanceFunction
        this.setSearchRange(3, 10);
        this.parallel = true;
        this.automaticThresholding = true;
        this.automaticThresholdingRatio = 0.05;
    }

    run(matrix) {
        this.init(matrix)

        this.minScore = Number.MAX_VALUE;
        this.maxScore = Number.NEGATIVE_INFINITY;

        const m = this.rows.length
        for(let i=0; i < m; ++i){
            const row = this.rows[i]
            const score = this.score_lof_sync(this.rows, row);
            if(isNaN(score)) {
                continue
            }
            if(isInfinite(score)) {
                continue
            }
            this.minScore = Math.min(score, this.minScore);
            this.maxScore = Math.max(score, this.maxScore);
        }
        

        if(this.automaticThresholding){
            this.adjustThreshold(this.rows);
        }

        for(let i=0; i < m; ++i){
            const row = this.rows[i]
            this.scores[i] = this.isAnomaly(row) ? 1 : 0
        }

        return this.scores;
    }

    init(matrix) {
        this.scores = []
        this.rows = matrix.map((row, i) => {
            return new Row(row, i)
        })
    }


    adjustThreshold(rows){
        const m = rows.length;
        const orders = []
        const probs = []
        for(let i=0; i < m; ++i){
            const row = rows[i];
            const prob = this.evaluate(row);
            probs.push(prob);
            orders.push(i);           
        }
        // sort descendingly by probability values
        orders.sort((a,b) => {
            const prob1 = probs[a]
            const prob2 = probs[b]
            return prob2 - prob1
        })
          
        const selected_index = this.autoThresholdingCaps(orders.length);
        if(selected_index >= orders.length){
            this.threshold = probs[orders[(orders.length - 1)]]
        } else{
            this.threshold = probs[orders[selected_index]];
        }
    }


    autoThresholdingCaps(m){
        return Math.max(1, (this.automaticThresholdingRatio * m));
    }

    setSearchRange(minPtsLB, minPtsUB) {
        this.minPtsLB = minPtsLB;
        this.minPtsUB = minPtsUB;
    }

    isAnomaly(row) {
        const score_lof = this.evaluate(row);
        return score_lof > this.threshold;
    }

    evaluate(row){
        let score = this.score_lof_sync(this.rows, row);
        score -= this.minScore;
        if(score < 0) {
            score = 0;
        }
        score /= (this.maxScore - this.minScore);
        if(score > 1) {
            score = 1
        }
        return score;
    }


    score_lof_sync(rows, row){
        let maxLOF = Number.NEGATIVE_INFINITY;
        for(let minPts = this.minPtsLB; minPts <= this.minPtsUB; ++minPts) { 
            const lof = this.local_outlier_factor(rows, row, minPts);
            if(isNaN(lof)) {
                continue
            }
            maxLOF = Math.max(maxLOF, lof);
        }
        return maxLOF;
    }

    local_outlier_factor(rows, p, k){

        const knn_p = this.getKNearestNeighbors(rows, p, k) // List<TupleTwo<DataRow, Double>>
        const lrd_p = this.local_reachability_density_knn(rows, p, k, knn_p);
        let sum_lrd = 0;
        knn_p.forEach(o => {
            sum_lrd += this.local_reachability_density(rows, o.row, k);
        })
  
        if(isInfinite(sum_lrd) && isInfinite(lrd_p)){
            return 1.0 / knn_p.length;
        }

        const lof = (sum_lrd / lrd_p) / knn_p.length;

        return lof;
    }



    getKNearestNeighbors (rows, p, k) {
        if (!p.neighbors) {
            p.neighbors = this.getNeighbours(rows, p)
        }
        return p.neighbors.slice(0, k)
    }

    getNeighbours (rows, p) {
        const temp = [];
        rows.forEach(q => {
            if (q.index !== p.index){   
                const distance = this.distanceFunction(p.value, q.value)
                temp.push(new Neighbor(q, distance))                    
            }
        })
        temp.sort((a, b) => {
            return a.distance - b.distance
        })
        return temp
    }

    getKthNearestNeighbor (rows, o, k) {
        const knn = this.getKNearestNeighbors(rows, o, k)
        return knn[knn.length - 1]
    }


    k_distance(rows, o, k){
        const kth = this.getKthNearestNeighbor(rows, o, k)
        return kth.distance
    }

    reach_dist(rows, p, o, k){
        const distance_p_o = this.distanceFunction(p.value, o.value)
        const distance_k_o = this.k_distance(rows, o, k)
        return Math.max(distance_k_o, distance_p_o)
    }


    local_reachability_density(rows, p, k){
        const knn_p = this.getKNearestNeighbors(rows, p, k);
        const density = this.local_reachability_density_knn(rows, p, k, knn_p);
        return density;
    }

    local_reachability_density_knn(rows, p, k, knn_p){
        let sum_reach_dist = 0;
        knn_p.forEach(o => {
            sum_reach_dist += this.reach_dist(rows, p, o.row, k);
        }) // List of Neighbors
        const density = 1 / (sum_reach_dist / knn_p.length);
        return density;
    }

}

class Neighbor {

    constructor (row, distance) {
        this.row = row
        this.value = row.value
        this.distance = distance
    }
}

class Row {
    constructor (row, i) {
        this.value = row,
        this.index = i,
        this.neighbors = undefined
    }
}

function isInfinite(x) {
    return x === Infinity || x == Number.NEGATIVE_INFINITY
}