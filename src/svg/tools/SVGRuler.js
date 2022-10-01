export default class SVGRuler {

    constructor (value, selection, zoom) {
        this.value = value
        this.selection = selection
        this.zoom = zoom
    }

    setZoom (z) {
        this.zoom = z
    }

    correct (pos) {
        return pos
    }

}