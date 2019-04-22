import domGeom from 'dojo/domGeom'

class win {

    constructor () {
        this.doc =  document
    }

    body () {
        return document.getElementsByTagName("BODY")[0]
    }

    getBox (doc){     
        doc = doc || window.document;
        var scrollRoot = doc.documentElement
        var scroll = domGeom.docScroll(doc)
        var w = 0
        var h = 0
        // if(has("touch")){ // if(scrollbars not supported)
        //    var uiWindow = window.get(doc);   // use UI window, not dojo.global window
        //    // on mobile, scrollRoot.clientHeight <= uiWindow.innerHeight <= scrollRoot.offsetHeight, return uiWindow.innerHeight
        //    w = uiWindow.innerWidth || scrollRoot.clientWidth; // || scrollRoot.clientXXX probably never evaluated
        //    h = uiWindow.innerHeight || scrollRoot.clientHeight;
        // }else{
            // on desktops, scrollRoot.clientHeight <= scrollRoot.offsetHeight <= uiWindow.innerHeight, return scrollRoot.clientHeight
            // uiWindow.innerWidth/Height includes the scrollbar and cannot be used
        w = scrollRoot.clientWidth;
        h = scrollRoot.clientHeight;
        //}
        return {
            l: scroll.x,
            t: scroll.y,
            w: w,
            h: h
        };
    }
}
export default new win()