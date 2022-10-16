import on from 'dojo/on'
import win from 'dojo/_base/win'
import * as SVGUtil from '../SVGUtil'

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

    onZoom () {}

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

    getBox (start, end) {
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
        return box;
    }


    isSelectionStarted () {
        this.logger.log(-5, 'isSelectionStarted', 'enter', this._isSelectStarted)
        return this._isSelectStarted
    }

    onSelectStart(point) {
        this.logger.log(-5, 'onSelectStart', 'enter')
        this._isSelectStarted = true
        this._selectStart = point
        this._selectionToolUpListener = on(win.body(),"mouseup", () => this.onMouseUp() );
    }

    onSelectMove (point) {
        if (this._isSelectStarted && this._selectStart) {
            this._selectBox = this.getBox(this._selectStart, point)
            this.editor.setSelectBox(this._selectBox)
        }
    }

    onSelectEnd () {
        this.logger.log(-5, 'onSelectEnd', 'enter')

        if (this._isSelectStarted && this._selectBox) {
            const selectBox = this._selectBox 
            const paths = this.editor.value
            const inBox = paths.filter(path => SVGUtil.isPathInBox(path, selectBox))
            //console.debug('onSelectEnd', inBox.map(p => p.id))
            if (inBox.length === 0) {
                this.editor.unSelect()
            } else {
                this.select(inBox.map(p => p.id))
            }   
        }
        this.clearSelect()
    }


    clearSelect () {
        console.debug('clearSelect')
        if (this._isSelectStarted) {
            this.editor.setSelectBox()
            delete this._selectStart
            delete this._selectBox
        }
        this._isSelectStarted = false
        if (this._selectionToolUpListener) {
            this._selectionToolUpListener.remove()
        }
        delete this._selectionToolUpListener
    }

}