
export default class Tool {

    constructor (editor) {
        if (!editor) {
            console.error('Tool.constrcutor() > No editor passed')
        }
        this.editor = editor
        this.zoom = editor.zoom
        this._isSelectStarted = false
    }


    onElementHover () {}

    onElementBlur () {}

    onElementClick () {}

    select (ids) {
        this.editor.setHover(null)
        this.editor.select(ids)
        this.editor.setState('selectEnd')
    }

    onZoom (zoom) {
        this.zoom = zoom
    }

    onClick() {}

    onMove () {}

    onMouseDown () {}

    onMouseUp () {}

    onDoubleClick () {
        // should we some how go back to select?
    }

    onEsc () {
        // should we somehow end editor?
    }

    onEnter () {}

    onDelete () {}

    onJointMouseDown() {}

    onJointMouseUp() {}

    onJointClick () {}

    onBBoxMouseDown () {}

    onBBoxMouseUp () {}

    onBBoxMouseClick () {}

    onResizeMouseDown () {}

    onResizeMouseUp () {}

    onResizeMouseClick () {}

    onBezierMouseDown () {}

    onBezierMouseUp () {}

    onBezierClick () {}

    onBezierMouseOver () {}

    onSplitPointMouseDown () {}

    onSplitPointMouseUp () {}

    onSplitPointClick () {}

    updateRuler() {
        this.editor.startRuler(this.path, [this.path.d.length-1])
    }

    endRuler () {
        this.editor.endRuler()
    }


    getBox (start, end, isShift) {
        const box = {x:0, y:0, w: 5, h : 5};
        if(start.x < end.x){
            box.x = start.x;
        } else {
            box.x = end.x;
        }
        if(start.y < end.y){
            box.y = start.y;
        } else {
            box.y = end.y;
        }
        box.w = Math.abs(start.x - end.x);
        box.h = Math.abs(start.y - end.y);

        if (isShift) {
            // here is a bug if we have negative...
            const max = Math.max(box.w, box.h)
            box.h = max
            box.w = max
        }
        return box;
    }


}