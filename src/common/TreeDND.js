class TreeDND {

    constructor (){
        this.currentElement = null
    }

    start (e) {
        this.currentElement = e
    }

    get() {
        return this.currentElement
    }

    end () {
        this.currentElement = null
    }

}
export default new TreeDND