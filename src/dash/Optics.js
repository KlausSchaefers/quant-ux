import * as Distance from './Distance'
import Heap from './Heap'

export default class OPTICS {
   
    constructor(epsilon = 1, minPts = 2, distanceFunction = Distance.l2) {
        this.epsilon = epsilon;
        this.minPts = minPts;
        this.distancefunction = distanceFunction;
       
        this._rows = []
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
                    const seeds = new Heap(d => d.reachabilityDistance, "min")
                    this.updateQueue(p, seeds)
                    this.expandCluster(seeds, this._clusters[cluster_index])
                }
            }
        })
        
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
    
    getNeighbors(p) {
        if (p.neighbors) {
            return p.neighbors
        } 
        const neighbors = [];
        this._rows.forEach(q => {
            if (q.index !== p.index){
                if (this.distancefunction(p.value, q.value) < this.epsilon) {
                    neighbors.push(q)
                }
            }
        })
        return neighbors;
    }

    coreDistance(p) {
        if (p.neighbors && p.neighbors.length <= this.minPts) {
            return undefined
        }
        return this.distancefunction(p.value, p.neighbors[this.minPts].value)
    }
    
    updateQueue(p, seeds) {

        const coreDistance = this.coreDistance(p)
        const neighbors = this.getNeighbors(p)

        for (const q of neighbors) {
            if (!q.processed) {
                const new_reachabilityDistance = Math.max(coreDistance, this.distancefunction(p.value, q.value))
                if (seeds.contains(q)) {
                    q.reachabilityDistance = new_reachabilityDistance
                    seeds.push(q)
                } else {
                    if (new_reachabilityDistance < q.reachabilityDistance) {
                        // add new diatance and sort heap
                        q.reachabilityDistance = new_reachabilityDistance
                        seeds = Heap.heapify(seeds.getData(), d => d.reachabilityDistance, "min")
                    }
                }
            }
        }
    }
    
    expandCluster(seeds, cluster) {
        const ordered_list = this._orderedlist
        while (!seeds.empty()) {
            const q = seeds.pop().element
            q.neighbors = this.getNeighbors(q)
            q.processed = true
            cluster.push(q.index)
            ordered_list.push(q)
            if (this.coreDistance(q) != undefined) {
                this.updateQueue(q, seeds)
                this.expandCluster(seeds, cluster)
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