import Tool from './Tool'
import Logger from 'common/Logger'
import on from 'dojo/on'
import win from 'dojo/_base/win'
import * as SVGUtil from '../SVGUtil'


export default class SelectTool extends Tool {

    constructor (editor) {
        super(editor)
        this.logger = new Logger('SelectTool')
    }

    onElementClick (path) {
        this.logger.log(-5, 'onElementClick', path.id)
        this.select([path.id])
        this.clearSelect()
    }

    onClick() {
        this.logger.log(-5, 'onClick', this.editor.hover)
        // We need to ue click and not mouseUp, because
        // otherwise the moveTool gets started before and will
        // shut down because it receives the click.
        if (this.isSelectionStarted()) {
            this.onSelectEnd()
            return
        }
      
        if (this.editor.hover) {
          this.select([this.editor.hover])
        }
        this.clearSelect()
    }

    onElementHover(path) {
        this.editor.setHover(path.id)
    }

    onElementBlur() {
        this.editor.setHover(null)
    }

    onMouseDown (point) {
        this.logger.log(5, 'onMouseDown', 'enter', point)
        this.onSelectStart(point)
    }

    onMove (point) {
       this.onSelectMove(point)
    }


    isSelectionStarted () {
        return this._isSelectStarted
    }

    onSelectStart(point) {
        this.logger.log(5, 'onSelectStart', 'enter')
        this.editor.unSelect()
        this._isSelectStarted = true
        this._selectStart = point
        this._selectionToolUpListener = on(win.body(),"mouseup", () => this.onMouseUp() );
    }

    onSelectMove (point) {
        if (this._isSelectStarted && this._selectStart) {
            this._selectBox = this.getBox(this._selectStart, point)
            const zoomedBox = SVGUtil.getZoomedBox(this._selectBox, this.zoom)
            this.editor.setSelectBox(zoomedBox)
        }
    }

    onSelectEnd () {
        this.logger.log(5, 'onSelectEnd', 'enter')
        if (this._isSelectStarted && this._selectBox) {
            const selectBox = this._selectBox 
            const paths = this.editor.value
            console.debug(paths)
            console.debug(selectBox)
            const inBox = paths.filter(path => SVGUtil.isPathInBox(path, selectBox))
            if (inBox.length === 0) {
                this.editor.unSelect()
            } else {
                this.select(inBox.map(p => p.id))
            }   
        }
        this.clearSelect()
    }

    clearSelect () {
        this.logger.log(5, 'clearSelect', 'enter')
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