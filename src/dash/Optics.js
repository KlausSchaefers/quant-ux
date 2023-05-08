// based on https://en.wikipedia.org/wiki/OPTICS_algorithm
import * as Distance from './Distance'
import PriorityQueue from './PriorityQueue'

export default class OPTICS {
   
    constructor(epsilon = 1, minPts = 2, distanceFunction = Distance.l2) {
        this.epsilon = epsilon;
        this.minPts = minPts;
        this.distancefunction = distanceFunction;
        return ;
    }

    run(matrix) {
        this.init(matrix)
        let cluster_index = 0;
        this._rows.forEach(p => {
            if (!p.processed) {

                p.neighbors = this.getNeighbors(p)
                p.processed = true;

                this._clusters.push([p.index])
                cluster_index = this._clusters.length - 1
                this._orderedlist.push(p)

                if (this.coreDistance(p) != undefined) {
                    const priorityQueue = new PriorityQueue("min")
                    this.updateQueue(p, priorityQueue)
                    this.expandCluster(priorityQueue, this._clusters[cluster_index])
                }
            }
        })
        return this.filterOutliers()
    }

    filterOutliers () {
        return this._clusters.filter(cluster => {
            return cluster.length >= this.minPts
        })
    }

    init(matrix) {
        this._orderedlist = []
        this._clusters = []
        this._rows = matrix.map((row, i) => {
            return new Row(row, i)
        })
    }
    
    getNeighborsUnsorted(p, epsilon = this.epsilon) {
        if (p.neighbors) {
            return p.neighbors
        } 
        const neighbors = [];
        this._rows.forEach(q => {
            if (q.index !== p.index){
                let distance = this.distancefunction(p.value, q.value)
                if (distance < epsilon) {
                    neighbors.push(q)
                }
            }
        })
        return neighbors;
    }

    getNeighbors(p, epsilon = this.epsilon) {
        if (p.neighbors) {
            return p.neighbors
        } 
        const temp = [];
        this._rows.forEach(q => {
            if (q.index !== p.index){
                let distance = this.distancefunction(p.value, q.value)
                if (distance < epsilon) {
                    temp.push({
                        row: q,
                        distance: distance
                    })
                }
            }
        })
        temp.sort((a, b) => {
            return a.distance - b.distance
        })
        const neighbors = temp.map(t => t.row)
        p.neighbors = neighbors
        return neighbors;
    }

    coreDistance(p) {
        if (p.neighbors && p.neighbors.length <= this.minPts) {
            return undefined
        }
        return this.distancefunction(p.value, p.neighbors[this.minPts].value)
    }

    coreDistanceDynamic(p) {
        const l = this.epsilon;
        for (let coreDistCand = 0; coreDistCand < l; coreDistCand++) {
            const neighbors = this.getNeighbors(p, coreDistCand);
            if (neighbors.length >= this.minPts) {
                return coreDistCand
            }
        }
        return
    }
    
    updateQueue(p, priorityQueue) {

        const coreDistance = this.coreDistance(p)
        const neighbors = this.getNeighbors(p)

        for (const q of neighbors) {
            if (!q.processed) {
                const new_reachabilityDistance = Math.max(coreDistance, this.distancefunction(p.value, q.value))
                if (priorityQueue.contains(q)) {
                    q.reachabilityDistance = new_reachabilityDistance
                    priorityQueue.push(q, q.reachabilityDistance)
                } else {
                    if (new_reachabilityDistance < q.reachabilityDistance) {
                        // add new diatance and re-sort queue
                        q.reachabilityDistance = new_reachabilityDistance
                        priorityQueue = PriorityQueue.heapify(priorityQueue.getElements(), priorityQueue.getValues(), "min")
                    }
                }
            }
        }
    }
    
    expandCluster(priorityQueue, cluster) {
        const orderedlist = this._orderedlist
        while (!priorityQueue.empty()) {
            const q = priorityQueue.pop().element
            q.neighbors = this.getNeighbors(q)
            q.processed = true
            cluster.push(q.index)
            orderedlist.push(q)
            if (this.coreDistance(q) != undefined) {
                this.updateQueue(q, priorityQueue)
                this.expandCluster(priorityQueue, cluster)
            }
        }
    }
    
}

class Row {
    constructor (row, i) {
        this.value = row,
        this.index = i,
        this.reachabilityDistance = undefined
        this.processed = false
        this.neighbors = undefined
    }
}