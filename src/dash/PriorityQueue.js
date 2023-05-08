export default class PriorityQueue {
    
    constructor(comparator = "min") {
        this.elements = [];
        if (comparator == "min") {
            this._comparator = (a, b) => a < b;
        } else if (comparator == "max") {
            this._comparator = (a, b) => a > b;
        } else {
            this._comparator = comparator;
        }        
    }

    contains (q) {
        return this.elements.findIndex(d => d.element == q) < 0
    }
  
    static heapify(elements, values,  comparator = "min") {
        const heap = new PriorityQueue(comparator);
        const l = elements.length
        for (let i = 0; i< l; i++) {
            const element = elements[i]
            const value = values[i]
            heap.push(element, value)
        }
        return heap;
    }

    swap(index_a, index_b) {
        const elements = this.elements;
        [elements[index_b], elements[index_a]] = [elements[index_a], elements[index_b]];
        return;
    }

    heapifyUp() {
        const elements = this.elements;
        let index = elements.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (!this._comparator(this.elements[index].value, this.elements[parentIndex].value)) {
                break;
            } else {
                this.swap(parentIndex, index)
                index = parentIndex;
            }
        }
    }

    push(element, value) {
        this.elements.push(new PriorityQueueElement(element, value));
        this.heapifyUp();
    }

    heapifyDown(start_index=0) {
        const elements = this.elements;
        const comparator = this._comparator;
        const length = elements.length;
        let left = 2 * start_index + 1;
        let right = 2 * start_index + 2;
        let index = start_index;
        if (left < length && comparator(elements[left].value, elements[index].value)) {
            index = left;
        }
        if (right < length && comparator(elements[right].value, elements[index].value)) {
            index = right;
        }
        if (index !== start_index) {
            this.swap(start_index, index);
            this.heapifyDown(index);
        }
    }

    pop() {
        if (this.elements.length === 0) {
            return null;
        } else if (this.elements.length === 1) {
            return this.elements.pop();
        }
        this.swap(0, this.elements.length - 1);
        const item = this.elements.pop();
        this.heapifyDown();
        return item;
    }

    getElements() {
        return this.elements.map(d => d.element)
    }

    getValues() {
        return this.elements.map(d => d.value)
    }

    length() {
        return this.elements.length;
    }

    empty() {
        return this.elements.length === 0;
    }
}

class PriorityQueueElement {
    constructor (element, value) {
        this.element = element
        this.value = value
    }
}