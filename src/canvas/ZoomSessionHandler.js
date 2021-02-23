
/**
 * This class smoothes and snapps the mouse wheel events, which can by some how tricky in MacOS. Small strockes might still
 * send mouse events after wards. Sometimes even the direction changes! To make mouse wheel more usable, this class will
 * snapp temp calues in certain ranges...
 */
export default class ZoomSessionHandler {

    constructor (zoom, snappPoints = [0.25, 0.5, 0.75, 1, 1.5, 2], step = 0.01) {
      this.zoom = zoom
      this.zoomStep = step
      this._tempZoom = zoom
      this.snappPoints = snappPoints
      this._lastUpdate = 0
    }

    setSnappPoints (points) {
      this.snappPoints = points
    }

    setZoom (zoom) {
      this.zoom = zoom
      this._tempZoom = zoom
    }

    minus () {
      this.reset()
      let v = Math.max(0.05, this._tempZoom - this.zoomStep)
      return this.snapp(v)
    }

    plus () {
      this.reset()
      let v = Math.min(3, this._tempZoom + this.zoomStep)
      return this.snapp(v)
    }

    snapp (v) {
      let r = Math.round(v * 100) / 100
      this._tempZoom = r
      this.zoom = r
      this.snappPoints.forEach(point => {
        let dif = Math.abs(v - point)
        /**
         * If we want to make this really cool we could make the
         * snapp with dependen of the scroll velocity (e.g. frequencey of last events.)
         * For slow scrolling snapp could be 0.3 or so, whicjh for fast scroll it could be 0.7 or so
         */
        if (dif < 0.03) {
          this.zoom = point
        }
      })

      return this.zoom
    }

    reset () {
      let now = new Date().getTime()
      if (now - this._lastUpdate > 1000) {
        /**
         * We reset the temp value to the last 'offical' value
         * after the scrolling has stopped (= 1 sec of inactivity).
         * This is important of we have snapping, otherwise we might to scorll to fast out of snapping...
         */
        this._tempZoom = this.zoom
      }
      this._lastUpdate = now
    }

}
