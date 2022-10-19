import Tool from './Tool'
import * as SVGUtil from '../SVGUtil'
import Logger from '../../common/Logger'

export default class MoveTool extends Tool{

    constructor (editor) {
        super(editor)
        this.logger = new Logger('MoveTool')
        this.showBoundingBox()
    }

    showBoundingBox () {
        this.logger.log(3, 'showBoundingBox', 'enter')
        const selected = this.editor.getSelectedElements()
        if (selected && selected.length > 0) {
            const boxes = selected.map(s => {
                const svg = this.editor.getSVGElement(s)
                return SVGUtil.getBBox(svg)
            })
            const boundingBox = SVGUtil.getBoundingBoxByBoxes(boxes)
            this.selected = selected
            this.editor.setBoundingBox(boundingBox)

        } else {
            this.logger.error('showBoundingBox', 'No selection')
        }
    }

    onZoom (z) {
        this.logger.log(3, 'onZoom', 'enter', z)
        this.zoom = z
        this.showBoundingBox()
    }


    /**
     * Implement some state machine:
     *
     * 1) If we have a split point, split
     *
     * 2) If we have a selected joint, remove selection
     *
     * 3) If we have no movePoint, end the tool
     *
     */
    onClick() {
        this.logger.log(1, 'onClick', 'enter')
        if (this.isResize) {
            this.cleanMove()
            return
        }
        this.editor.setState('moveEnd')
    }

    onDoubleClick () {
        this.editor.setState('moveDoubleClick')
    }


    onMove (pos) {     
        if (this.bbox) {
            if (this.handler) {
               this.resizeBoundingBox(this.bbox, pos)
            } else {
                this.moveBoundingBox(pos)
            }
        }
    }

    resizeBoundingBox (zoomedBoundingBox, pos) {   
        // resize bounding box!
        let newZoomedBoundingBox = this.getResizedBundingBox(zoomedBoundingBox, this.handler.type, pos)
        if (pos.shiftKey) {
            newZoomedBoundingBox = this.scaleToSelection(zoomedBoundingBox, newZoomedBoundingBox, this.handler.type)
        }
        const newBoundingBox = SVGUtil.getUnZoomedBox(newZoomedBoundingBox, this.zoom)
      
        // scale paths
        this.selected.forEach((element,i) => {
            const relativePositions = this.relativePositions[i]
            if (element.type === 'Path') {
                element.d.forEach((point,j) => {
                    const rel = relativePositions[j]
                    point.x = newBoundingBox.x + newBoundingBox.w * rel.x
                    point.y = newBoundingBox.y + newBoundingBox.h * rel.y

                    /**
                     * Check also x1 and x2 for Curves
                     */
                    if (point.t === 'C') {
                        point.x1 = newBoundingBox.x + newBoundingBox.w * rel.x1
                        point.y1 = newBoundingBox.y + newBoundingBox.h * rel.y1
                        point.x2 = newBoundingBox.x + newBoundingBox.w * rel.x2
                        point.y2 = newBoundingBox.y + newBoundingBox.h * rel.y2
                    }
                })
            }
        })

        this.editor.setBoundingBox(newZoomedBoundingBox)
    }

    scaleToSelection(source, target, type = '') {       
        if (type === 'North' || type === 'South') {
            const scale = target.h / source.h
            const w =  Math.round(target.w * scale)
            const offset = (type === 'LeftUp' || type === 'LeftDown') ? (w - target.w) : 0
            return {
                x: target.x - offset,
                y: target.y,
                w: w,
                h: target.h
            }
        }
        if (type === 'East' || type === 'West') {
            const scale = target.w / source.w
            const h =  Math.round(target.h * scale)
            const offset = (type === 'LeftUp' || type === 'RightUp' )? (h - target.h) : 0   
            //console.debug('scale', scale, ' >> ',source.w, source.h, target.h, '==', h)
            return {
                x: target.x,
                y: target.y - offset,
                w: target.w,
                h: h
            }
        }
        // FIXME: here is still a bug for the corners
        return target
    }

    getResizedBundingBox (box, type, pos) {
        // this pos is unZoomed, but the bounding box is zoomed.
        const difX = (pos.x - this.startPos.x) * this.zoom
        const difY = (pos.y - this.startPos.y) * this.zoom
        const result = Object. assign({}, box)
        switch (type) {
            case 'LeftUp':
                result.x = result.x + difX
                result.y = result.y + difY
                result.w = result.w - difX
                result.h = result.h - difY
                break;

            case 'LeftDown':
                result.x = result.x + difX
                result.w = result.w - difX
                result.h = result.h + difY
                break;

            case 'RightUp':
                result.y = result.y + difY
                result.w = result.w + difX
                result.h = result.h - difY
                break;

            case 'RighDown':
                result.w = result.w + difX
                result.h = result.h + difY
                break;

            case 'South':
                result.h = result.h + difY
                break;

            case 'North':
                result.y = result.y + difY
                result.h = result.h - difY
                break;

            case 'West':
                result.x = result.x + difX
                result.w = result.w - difX
                break;

            case 'East':
                result.w = result.w + difX
                break;

            default:
                break
        }
        return result
    }

    moveBoundingBox (pos) {
        const difX = pos.x - this.startPos.x
        const difY = pos.y - this.startPos.y
        //this.logger.log(-1, 'moveBoundingBox', 'enter', this.startPos)

        // update paths
        this.selected.forEach((element,i) => {
            const positions = this.positions[i]
            if (element.type === 'Path') {
                element.d.forEach((point,j) => {
                    const start = positions[j]
                    point.x = start.x + difX
                    point.y = start.y + difY

                    /**
                     * Check also x1 and x2 for Curves
                     */
                    if (point.t === 'C') {
                        point.x1 = start.x1 + difX
                        point.y1 = start.y1 + difY
                        point.x2 = start.x2 + difX
                        point.y2 = start.y2 + difY
                    }
                })
            }
        })

        // update bounding box. We have to zoom 
        // here the difs, because the bounding box is not scalled
        const newBoundingBox = {
            x: this.bbox.x + difX * this.zoom,
            y: this.bbox.y + difY * this.zoom,
            w: this.bbox.w,
            h: this.bbox.h
        }
        this.editor.setBoundingBox(newBoundingBox)
    }

    onBBoxMouseDown (bbox, pos) {
        this.logger.log(1, 'onBBoxMouseDown', 'enter')
        this.editor.setBoundingBoxVisible(false)
        this.initMove(bbox, pos)
        this.positions = this.selected.map(element => {
            if (element.type === 'Path') {
                return element.d.map(point => {
                    if (point.t === 'C') {
                        return {
                            x: point.x,
                            y: point.y,
                            x1: point.x1,
                            y1: point.y1,
                            x2: point.x2,
                            y2: point.y2
                        }
                    }
                    return {
                        x: point.x,
                        y: point.y
                    }
                })
            }
            return []
        })
        this.editor.setCursor('move')
        this.isMove = true
    }

    onBBoxMouseUp () {
        this.logger.log(1, 'onBBoxMouseUp', 'enter')
        if (this.isMove) {
            this.cleanMove()
            this.editor.setBoundingBoxVisible(true)
            this.editor.setCursor('default')
            this.editor.onChange()
        }
    }

    onBBoxMouseClick () {
    }

    onResizeMouseDown (handler, zoomedBBox, pos) {
        this.logger.log(1, 'onResizeMouseDown', 'enter', handler.type)
       
        this.initMove(zoomedBBox, pos)
        const bbox = SVGUtil.getUnZoomedBox(zoomedBBox, this.zoom)
        this.relativePositions = SVGUtil.getRelativePaths(bbox, this.selected)
        this.handler = handler
        this.isResize = true
    }

    onResizeMouseUp () {
        this.editor.onChange()
    }

    onResizeMouseClick () {
        this.logger.log(1, 'onResizeMouseClick', 'enter')
        this.cleanMove()
    }

    onElementHover(path) {
        this.editor.setHover(path.id)
    }

    onElementBlur() {
        this.editor.setHover(null)
    }

    onElementClick (path) {
        this.logger.log(1, 'onResizeMouseClick', 'enter')
        this.select([path.id])
    }

    onDelete () {
        this.logger.log(1, 'onDelete', 'enter')
        this.editor.deleteSelection()
    }


    initMove (bbox, pos) {
        this.bbox = Object. assign({}, bbox)
        this.startPos = pos
    }


    onMouseDown (point) {
        this.logger.log(5, 'onMouseDown', 'enter', point)
        if (!this.isMove) {
            this.editor.setState('moveCanvasMouseDown', point)
        }
    }

    cleanMove () {
        delete this.bbox
        delete this.startPos
        delete this.positions
        delete this.relativePositions
        delete this.handler
        delete this.isResize
        delete this.isMove
    }



}