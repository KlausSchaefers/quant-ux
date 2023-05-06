/**
 * Based from https://github.com/uhho/density-clustering/blob/master/lib/DBSCAN.js
 * Original author: Lukasz Krawczyk <contact@lukaszkrawczyk.eu>, 
 * copyright MIT
 */
import * as distance from './Distance'

export default class DBScan {

    constructor(epsilon = 1, minPts = 2, distanceFunction = distance.l2) {
        this.dataset = [];
        this.epsilon = epsilon;
        this.minPts = minPts;
        this.distance = distanceFunction;
        this.clusters = [];
        this.noise = [];
        this._visited = [];
        this._assigned = [];
        this._datasetLength = 0;
    }

    run(dataset) {
        this.init(dataset);

        for (let pointId = 0; pointId < this._datasetLength; pointId++) {
            if (this._visited[pointId] !== 1) {
                this._visited[pointId] = 1;       
                const neighbors = this.getNeighbours(pointId);
                if (neighbors.length < this.minPts) {
                    this.noise.push(pointId);
                } else {
                    // create new cluster and add point
                    var clusterId = this.clusters.length;
                    this.clusters.push([]);
                    this.addToCluster(pointId, clusterId);
                    this.expandCluster(clusterId, neighbors);
                }
            }
        }
        return this.clusters;
    }

    init(dataset) {      
        this.dataset = dataset;
        this.clusters = [];
        this.noise = [];
        this._datasetLength = dataset.length;
        this._visited = new Array(this._datasetLength);
        this._assigned = new Array(this._datasetLength); 
    }

    expandCluster(clusterId, neighbors) {
        /**
         * It's very important to calculate length of neighbors array each time,
         * as the number of elements changes over time
         */
        for (let i = 0; i < neighbors.length; i++) {
            const pointId2 = neighbors[i];
            if (this._visited[pointId2] !== 1) {
                this._visited[pointId2] = 1;
                const neighbors2 = this.getNeighbours(pointId2);
                if (neighbors2.length >= this.minPts) {
                    neighbors = this.mergeArrays(neighbors, neighbors2);
                }
            }
            // add to cluster
            if (this._assigned[pointId2] !== 1) {
                this.addToCluster(pointId2, clusterId);
            }
        }
    }

    addToCluster(pointId, clusterId) {
        this.clusters[clusterId].push(pointId);
        this._assigned[pointId] = 1;
    }

    getNeighbours(pointId) {
        const neighbors = [];
        for (let id = 0; id < this._datasetLength; id++) {
            const dist = this.distance(this.dataset[pointId], this.dataset[id]);     
            if (dist < this.epsilon) {
                neighbors.push(id);
            }
        }
        return neighbors;
    }

    mergeArrays(a, b) {
        const len = b.length;
        for (let i = 0; i < len; i++) {
            const P = b[i];
            if (a.indexOf(P) < 0) {
                a.push(P);
            }
        }
        return a;
    }

}