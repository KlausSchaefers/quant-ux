class domAttr {
    set (node, key, value) {
        node.setAttribute(key, value)
    }

    get (node, key) {
        return node.getAttribute(key)
    }
}

export default new domAttr()