export default class CommandStack {

    constructor () {
        this.stack = []
        this.pos = -1
    }

    init (data) {
        this.stack = []
        this.pos = -1
        if (data) {
            this.push(data)
        }
    }

    
    push (data) {
        const json = JSON.stringify(data)
        if (this.stack[this.stack.length - 1] === json) {
            return
        }
        if (this.pos < this.stack.length-1) {
            this.stack = this.stack.slice(0, this.pos+1)
        }
        this.stack.push(json)
        this.pos++
    }

    get(p) {
        const data = this.stack[p]
        if (data) {
            return JSON.parse(data)
        }
    }


    hasUndo () {
        return this.stack.length > 0 && this.pos > 0
    }

    undo() {
        if (this.pos >= 0) {
            this.pos--
            const data = this.stack[this.pos]
    
            if (data) {
                return JSON.parse(data)
            }
        }
    }

    hasRedo () {
        return this.pos < this.stack.length - 1
    }

    redo() {
        if (this.pos < this.stack.length - 1) {
            this.pos++
            const data = this.stack[this.pos]
            if (data) {
                return JSON.parse(data)
            }
        }
    }
}