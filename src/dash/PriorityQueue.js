/**
 * Based from https://github.com/uhho/density-clustering/blob/master/lib/DBSCAN.js
 * Original author: Lukasz Krawczyk <contact@lukaszkrawczyk.eu>, 
 * copyright MIT
 */

export default class PriorityQueue {

    constructor(elements, priorities, sorting) {
        this._queue = [];
        this._priorities = [];
        this._sorting = 'desc';
        this.init(elements, priorities, sorting);
    }

    init(elements, priorities, sorting) {
        if (elements && priorities) {
            this._queue = [];
            this._priorities = [];
            if (elements.length !== priorities.length) {
                throw new Error('Arrays must have the same length');
            }
            for (let i = 0; i < elements.length; i++) {
                this.insert(elements[i], priorities[i]);
            }
        }

        if (sorting) {
            this._sorting = sorting;
        }
    }

    insert(ele, priority) {
        let indexToInsert = this._queue.length;
        let index = indexToInsert;

        while (index--) {
            const priority2 = this._priorities[index];
            if (this._sorting === 'desc') {
                if (priority > priority2) {
                    indexToInsert = index;
                }
            } else {
                if (priority < priority2) {
                    indexToInsert = index;
                }
            }
        }

        this.insertAt(ele, priority, indexToInsert);
    }

    remove(ele) {
        let index = this._queue.length;
        while (index--) {
            const ele2 = this._queue[index];
            if (ele === ele2) {
                this._queue.splice(index, 1);
                this._priorities.splice(index, 1);
                break;
            }
        }
    }

    forEach(func) {
        this._queue.forEach(func);
    }

    getElements() {
        return this._queue;
    }

    getElementPriority(index) {
        return this._priorities[index];
    }

    getElementsWithPriorities() {
        const result = [];
        const l = this._queue.length;
        for (let i = 0; i < l; i++) {
            result.push([this._queue[i], this._priorities[i]]);
        }
        return result;
    }

    getPriorities() {
        return this._priorities;
    }

    insertAt(ele, priority, index) {
        if (this._queue.length === index) {
            this._queue.push(ele);
            this._priorities.push(priority);
        } else {
            this._queue.splice(index, 0, ele);
            this._priorities.splice(index, 0, priority);
        }
    }

}
