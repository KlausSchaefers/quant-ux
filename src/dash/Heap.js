export default class Heap {
    
    constructor(accessor = d => d, comparator = "min") {
        this._accessor = accessor;
        this.data = [];
        if (comparator == "min") {
            this._comparator = (a, b) => a < b;
        } else if (comparator == "max") {
            this._comparator = (a, b) => a > b;
        } else {
            this._comparator = comparator;
        }        
    }

    contains (q) {
        return this.data.findIndex(d => d.element == q) < 0
    }
  
    static heapify(elements, accessor = d => d, comparator = "min") {
        const heap = new Heap(accessor, comparator);
        const container = heap.data;
        for (const e of elements) {
            container.push(new HeapElement(e, accessor(e)));
        }
        for (let i = Math.floor((elements.length / 2) - 1); i >= 0; --i) {
            heap.heapifyDown(i);
        }
        return heap;
    }

    swap(index_a, index_b) {
        const container = this.data;
        [container[index_b], container[index_a]] = [container[index_a], container[index_b]];
        return;
    }

    heapifyUp() {
        const container = this.data;
        let index = container.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (!this._comparator(this.data[index].value, this.data[parentIndex].value)) {
                break;
            } else {
                this.swap(parentIndex, index)
                index = parentIndex;
            }
        }
    }

    push(element) {
        this.data.push(new HeapElement(element, this._accessor(element)));
        this.heapifyUp();
    }

    heapifyDown(start_index=0) {
        const container = this.data;
        const comparator = this._comparator;
        const length = container.length;
        let left = 2 * start_index + 1;
        let right = 2 * start_index + 2;
        let index = start_index;
        if (left < length && comparator(container[left].value, container[index].value)) {
            index = left;
        }
        if (right < length && comparator(container[right].value, container[index].value)) {
            index = right;
        }
        if (index !== start_index) {
            this.swap(start_index, index);
            this.heapifyDown(index);
        }
    }

    pop() {
        if (this.data.length === 0) {
            return null;
        } else if (this.data.length === 1) {
            return this.data.pop();
        }
        this.swap(0, this.data.length - 1);
        const item = this.data.pop();
        this.heapifyDown();
        return item;
    }

    getData() {
        return this.data.map(d => d.element)
    }

    getRawData() {
        return this.data;
    }

    length() {
        return this.data.length;
    }

    empty() {
        return this.data.length === 0;
    }
}

class HeapElement {
    constructor (element, value) {
        this.element = element
        this.value = value
    }
}