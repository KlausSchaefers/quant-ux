class domStyle {

    get (node) {
        return window.getComputedStyle(node, null)
    }

    set (node, styles) {
        for (let key in styles) {
            node.style[key] = styles[key]
        }
    }   
}
export default new domStyle()