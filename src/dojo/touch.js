import has from 'dojo/has'

/**
 * Abstract the different mouse and touch events away. Depeding on the device
 * mouse or touch events are used.
 * 
 * For mobile devices, we also set the options that are used in the on() function!
 * This is needed to bz able to stop prevent event propogation.
 */
class touch {

    constructor() {
        if (has('touch')) {
            this.press = 'touchstart'
            this.move = 'touchmove'
            this.release = 'touchend'
            this.options = {passive: false}
        } else {
            this.press = 'mousedown'
            this.move = 'mousemove'
            this.release = 'mouseup'
        }
        this.click = 'click'
        this.over = 'mouseover'
        this.out = 'mouseout'
        this.enter = 'mouseenter'
        this.leave = 'mouseleave'
    }
}

export default new touch()