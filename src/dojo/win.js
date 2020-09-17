class win {

    constructor () {
        this.doc =  document
    }

    body () {
        return document.getElementsByTagName("BODY")[0]
    }

    getBox (doc) {
        doc = doc || window.document;
        var scrollRoot = doc.documentElement
        var w = 0
        var h = 0
        w = scrollRoot.clientWidth;
        h = scrollRoot.clientHeight;
        return {
            w: w,
            h: h
        };
    }
}
export default new win()