
/**
 * @requires ./PriorityQueue.js
 */

if (typeof module !== 'undefined' && module.exports) {
    var PriorityQueue = require('./PriorityQueue.js');
}

/**
* OPTICS - Ordering points to identify the clustering structure
*
* @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
* @copyright MIT
*/

/**
* OPTICS class constructor
* @constructor
*
* @param {Array} dataset
* @param {number} epsilon
* @param {number} minPts
* @param {function} distanceFunction
* @returns {OPTICS}
*/
function OPTICS(dataset, epsilon, minPts, distanceFunction) {
/** @type {number} */
this.epsilon = 1;
/** @type {number} */
this.minPts = 1;
/** @type {function} */
this.distance = this._euclideanDistance;

// temporary variables used during computation

/** @type {Array} */
this._reachability = [];
/** @type {Array} */
this._processed = [];
/** @type {number} */
this._coreDistance = 0;
/** @type {Array} */
this._orderedList = [];

this._init(dataset, epsilon, minPts, distanceFunction);
}

/******************************************************************************/
// pulic functions

/**
* Start clustering
*
* @param {Array} dataset
* @returns {undefined}
* @access public
*/
OPTICS.prototype.run = function(dataset, epsilon, minPts, distanceFunction) {
this._init(dataset, epsilon, minPts, distanceFunction);

for (var pointId = 0, l = this.dataset.length; pointId < l; pointId++) {
  if (this._processed[pointId] !== 1) {
    this._processed[pointId] = 1;
    this.clusters.push([pointId]);
    var clusterId = this.clusters.length - 1;

    this._orderedList.push(pointId);
    var priorityQueue = new PriorityQueue(null, null, 'asc');
    var neighbors = this._regionQuery(pointId);

    // using priority queue assign elements to new cluster
    if (this._distanceToCore(pointId) !== undefined) {
      this._updateQueue(pointId, neighbors, priorityQueue);
      this._expandCluster(clusterId, priorityQueue);
    }
  }
}

return this.clusters;
};

/**
* Generate reachability plot for all points
*
* @returns {array}
* @access public
*/
OPTICS.prototype.getReachabilityPlot = function() {
var reachabilityPlot = [];

for (var i = 0, l = this._orderedList.length; i < l; i++) {
  var pointId = this._orderedList[i];
  var distance = this._reachability[pointId];

  reachabilityPlot.push([pointId, distance]);
}

return reachabilityPlot;
};

/******************************************************************************/
// protected functions

/**
* Set object properties
*
* @param {Array} dataset
* @param {number} epsilon
* @param {number} minPts
* @param {function} distance
* @returns {undefined}
* @access protected
*/
OPTICS.prototype._init = function(dataset, epsilon, minPts, distance) {

if (dataset) {

  if (!(dataset instanceof Array)) {
    throw Error('Dataset must be of type array, ' +
      typeof dataset + ' given');
  }

  this.dataset = dataset;
  this.clusters = [];
  this._reachability = new Array(this.dataset.length);
  this._processed = new Array(this.dataset.length);
  this._coreDistance = 0;
  this._orderedList = [];
}

if (epsilon) {
  this.epsilon = epsilon;
}

if (minPts) {
  this.minPts = minPts;
}

if (distance) {
  this.distance = distance;
}
};

/**
* Update information in queue
*
* @param {number} pointId
* @param {Array} neighbors
* @param {PriorityQueue} queue
* @returns {undefined}
* @access protected
*/
OPTICS.prototype._updateQueue = function(pointId, neighbors, queue) {
var self = this;

this._coreDistance = this._distanceToCore(pointId);
neighbors.forEach(function(pointId2) {
  if (self._processed[pointId2] === undefined) {
    var dist = self.distance(self.dataset[pointId], self.dataset[pointId2]);
    var newReachableDistance = Math.max(self._coreDistance, dist);

    if (self._reachability[pointId2] === undefined) {
      self._reachability[pointId2] = newReachableDistance;
      queue.insert(pointId2, newReachableDistance);
    } else {
      if (newReachableDistance < self._reachability[pointId2]) {
        self._reachability[pointId2] = newReachableDistance;
        queue.remove(pointId2);
        queue.insert(pointId2, newReachableDistance);
      }
    }
  }
});
};

/**
* Expand cluster
*
* @param {number} clusterId
* @param {PriorityQueue} queue
* @returns {undefined}
* @access protected
*/
OPTICS.prototype._expandCluster = function(clusterId, queue) {
var queueElements = queue.getElements();

for (var p = 0, l = queueElements.length; p < l; p++) {
  var pointId = queueElements[p];
  if (this._processed[pointId] === undefined) {
    var neighbors = this._regionQuery(pointId);
    this._processed[pointId] = 1;

    this.clusters[clusterId].push(pointId);
    this._orderedList.push(pointId);

    if (this._distanceToCore(pointId) !== undefined) {
      this._updateQueue(pointId, neighbors, queue);
      this._expandCluster(clusterId, queue);
    }
  }
}
};

/**
* Calculating distance to cluster core
*
* @param {number} pointId
* @returns {number}
* @access protected
*/
OPTICS.prototype._distanceToCore = function(pointId) {
var l = this.epsilon;
for (var coreDistCand = 0; coreDistCand < l; coreDistCand++) {
  var neighbors = this._regionQuery(pointId, coreDistCand);
  if (neighbors.length >= this.minPts) {
    return coreDistCand;
  }
}

return;
};

/**
* Find all neighbors around given point
*
* @param {number} pointId
* @param {number} epsilon
* @returns {Array}
* @access protected
*/
OPTICS.prototype._regionQuery = function(pointId, epsilon) {
epsilon = epsilon || this.epsilon;
var neighbors = [];

for (var id = 0, l = this.dataset.length; id < l; id++) {
  if (this.distance(this.dataset[pointId], this.dataset[id]) < epsilon) {
    neighbors.push(id);
  }
}

return neighbors;
};

/******************************************************************************/
// helpers

/**
* Calculate euclidean distance in multidimensional space
*
* @param {Array} p
* @param {Array} q
* @returns {number}
* @access protected
*/
OPTICS.prototype._euclideanDistance = function(p, q) {
var sum = 0;
var i = Math.min(p.length, q.length);

while (i--) {
  sum += (p[i] - q[i]) * (p[i] - q[i]);
}

return Math.sqrt(sum);
};

if (typeof module !== 'undefined' && module.exports) {
module.exports = OPTICS;
}