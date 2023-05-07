/**
 * Based from https://github.com/uhho/density-clustering/blob/master/lib/DBSCAN.js
 * Original author: Lukasz Krawczyk <contact@lukaszkrawczyk.eu>, 
 * copyright MIT
 */
import * as distance from './Distance'
import PriorityQueue from './PriorityQueue'


export default class Optics {

    constructor(epsilon = 1, minPts = 2, distanceFunction = distance.l2, coreMethod= 'simple') {
        this.epsilon = epsilon;
        this.minPts = minPts;
        this.distance = distanceFunction;
        this._reachability = [];
        this._processed = [];
        this._coreDistance = 0;
        this.coreMethod = coreMethod
        this._orderedList = [];
    }

    run(dataset) {
        this.init(dataset);
        const l = this.dataset.length
        for (let pointId = 0; pointId < l; pointId++) {
            if (this._processed[pointId] !== 1) {
                this._processed[pointId] = 1;
                this.clusters.push([pointId]);
                const clusterId = this.clusters.length - 1;
                this._orderedList.push(pointId);

           
                if (this.distanceToCore(pointId) !== undefined) {

                    const priorityQueue = new PriorityQueue(null, null, 'asc');
                    const neighbors = this.regionQuery(pointId);

                    this.updateQueue(pointId, neighbors, priorityQueue);
                    this.expandCluster(clusterId, priorityQueue);
                }
            }
            return this.clusters;
        }
    }

    init(dataset) {
        this.dataset = dataset;
        this.clusters = [];
        this._reachability = new Array(this.dataset.length);
        this._processed = new Array(this.dataset.length);
        this._coreDistance = 0;
        this._orderedList = [];
    }

    updateQueue(pointId, neighbors, queue) {
        
        this._coreDistance = this.distanceToCore(pointId);

        neighbors.forEach((pointId2) =>  {
            if (this._processed[pointId2] === undefined) {
                const dist = this.distance(this.dataset[pointId], this.dataset[pointId2]);
                const newReachableDistance = Math.max(this._coreDistance, dist);

                if (this._reachability[pointId2] === undefined) {
                    this._reachability[pointId2] = newReachableDistance;
                    queue.insert(pointId2, newReachableDistance);
                } else {
                    if (newReachableDistance < this._reachability[pointId2]) {
                        this._reachability[pointId2] = newReachableDistance;
                        queue.remove(pointId2);
                        queue.insert(pointId2, newReachableDistance);
                    }
                }
            }
        })
    }

    expandCluster(clusterId, queue) {
        const queueElements = queue.getElements();
        const l = queueElements.length;
        for (let p = 0; p < l; p++) {
            const pointId = queueElements[p];
            if (this._processed[pointId] === undefined) {
                var neighbors = this.regionQuery(pointId);
                this._processed[pointId] = 1;

                this.clusters[clusterId].push(pointId);
                this._orderedList.push(pointId);

                if (this.distanceToCore(pointId) !== undefined) {
                    this.updateQueue(pointId, neighbors, queue);
                    this.expandCluster(clusterId, queue);
                }
            }
        }
    }

   

    distanceToCore(pointId) {
        if (this.coreMethod === 'simple') {
            const neighbors = this.regionQuery(pointId);
            if (neighbors.length >= this.minPts) {
                const a = this.dataset[pointId]
                const b = this.dataset[neighbors[this.minPts]]
                return this.distance(a, b)
            }
        } else {
            const l = this.epsilon;
            for (let coreDistCand = 0; coreDistCand < l; coreDistCand++) {
                const neighbors = this.regionQuery(pointId, coreDistCand);
                if (neighbors.length >= this.minPts) {
                    return coreDistCand
                }
            }
        }

        return
    }

    regionQuery(pointId, epsilon) {
        epsilon = epsilon || this.epsilon;
        const neighbors = [];
        const l = this.dataset.length
        for (let id = 0; id < l; id++) {
            if (id !== pointId) {
                if (this.distance(this.dataset[pointId], this.dataset[id]) < epsilon) {
                    neighbors.push(id);
                }
            }
        }
        return neighbors;
    }

}