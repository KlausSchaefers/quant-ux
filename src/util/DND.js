import on from "dojo/on";
import win from 'dojo/_base/win'

export function onStartDND(e, moveLister, endListener) {
    return new DnDHandle(e, moveLister, endListener)
}

class DnDHandle {

    constructor (e, moveLister, endListener) {
        this.stopEvent(e)
        this.start = this.getMousePosition(e)
        this.moveHandle = on(win.body(),"mousemove", e => this.onDNDMove(e, moveLister))
        this.upHandle = on(win.body(),"mouseup", e => this.onDNDEnd(e, endListener))
        return false
    }

    remove () {
        if (this.moveHandle) {
            this.moveHandle.remove()
        }
        if (this.upHandle) {
            this.upHandle.remove()
        }
        delete this.moveHandle
        delete this.upHandle
    }

    onDNDMove(e, moveLister) {
        this.stopEvent(e)
        const pos = this.getMousePosition(e)
        const delta = {
            x: pos.x - this.start.x, 
            y: pos.y - this.start.y
        }
        if (moveLister) {
            moveLister(delta)
        }
        return false
    }
    
    onDNDEnd(e, endListener) {
        this.stopEvent(e)
        const pos = this.getMousePosition(e)
        const delta = {
            x: pos.x - this.start.x, 
            y: pos.y - this.start.y
        }
        if (endListener) {
            endListener(delta)
        }
        this.remove()
        return false
    }
    
    getMousePosition(e) {
        const result = { x: 0, y: 0 };
        if (e) {
            if (e.touches && e.touches.length > 0) {
                e = e.touches[0]
                result.x = e.clientX;
                result.y = e.clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                e = e.changedTouches[0]
                result.x = e.clientX;
                result.y = e.clientY;
            } else {
                result.x = e.pageX;
                result.y = e.pageY;
            }
        }
        return result;
    }

    stopEvent(e) {        
        if (e && e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }    
    }
}

