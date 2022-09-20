import Tool from './Tool'
import Logger from '../../common/Logger'

export default class MoveTool extends Tool{

    constructor (editor) {
        super(editor)
        this.logger = new Logger('MoveTool')
        let selected = this.editor.getSelectedElements()
        if (selected && selected.length > 0) {
            let boxes = selected.map(s => {
                let svg = this.editor.getSVGElement(s)
                return svg.getBBox()
            })
            let boundingBox = this.getBoundingBoxByBoxes(boxes)
            this.selected = selected
            this.editor.setBoundingBox(boundingBox)

        } else {
            this.logger.error('constructor', 'No selection')
        }
    }

    getBoundingBoxByBoxes (boxes) {
        const result = { x: 100000000, y: 100000000, w: 0, h: 0, isBoundingBox: true};

        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            result.x = Math.min(result.x, box.x);
            result.y = Math.min(result.y, box.y);
            result.w = Math.max(result.w, box.x + box.width);
            result.h = Math.max(result.h, box.y + box.height);
        }

        result.h -= result.y;
        result.w -= result.x;

        return result;
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
        this.logger.log(-1, 'onClick', 'enter')
        // FIXME: Click might be called if we release
        // on canvas an not the handler. Do we have to have some kind
        // of timeout?
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

    resizeBoundingBox (bbox, pos) {
        // update bounding box
        let newBoundingBox = this.getResizedBundingBox(bbox, this.handler.type, pos)

        // scale paths
        this.selected.forEach((element,i) => {
            let positions = this.positions[i]
            if (element.type === 'Path') {
                element.d.forEach((point,j) => {
                    let rel = positions[j]
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

        this.editor.setBoundingBox(newBoundingBox)
    }

    getResizedBundingBox (box, type, pos) {
        let difX = pos.x - this.startPos.x
        let difY = pos.y - this.startPos.y

        let result = Object. assign({}, box)
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
        let difX = pos.x - this.startPos.x
        let difY = pos.y - this.startPos.y
        //this.logger.log(-1, 'moveBoundingBox', 'enter', difX + ' ' + difY)

        // update paths
        this.selected.forEach((element,i) => {
            let positions = this.positions[i]
            if (element.type === 'Path') {
                element.d.forEach((point,j) => {
                    let start = positions[j]
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

        // update bounding box
        let newBoundingBox = {
            x: this.bbox.x + difX,
            y: this.bbox.y + difY,
            w: this.bbox.w,
            h: this.bbox.h
        }
        this.editor.setBoundingBox(newBoundingBox)
    }

    onBBoxMouseDown (bbox, pos) {
        this.logger.log(-1, 'onBBoxMouseDown', 'enter')
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
        this.logger.log(-1, 'onBBoxMouseUp', 'enter')
        if (this.isMove) {
            this.cleanMove()
            this.editor.setCursor('default')
        }
    }

    onBBoxMouseClick () {
    }

    onResizeMouseDown (handler, bbox, pos) {
        this.logger.log(-1, 'onResizeMouseDown', 'enter', handler.type)
        this.initMove(bbox, pos)
        this.positions = this.selected.map(element => {
            if (element.type === 'Path') {
                return element.d.map(point => {
                    if (point.t === 'C') {
                        return {
                            x: (point.x - bbox.x) / bbox.w,
                            y: (point.y - bbox.y) / bbox.h,
                            x1: (point.x1 - bbox.x) / bbox.w,
                            y1: (point.y1 - bbox.y) / bbox.h,
                            x2: (point.x2 - bbox.x) / bbox.w,
                            y2: (point.y2 - bbox.y) / bbox.h
                        }
                    }
                    return {
                        x: (point.x - bbox.x) / bbox.w,
                        y: (point.y - bbox.y) / bbox.h
                    }
                })
            }
            return []
        })
        this.handler = handler
        this.isResize = true
    }

    onResizeMouseClick () {
        this.logger.log(-1, 'onResizeMouseClick', 'enter')
        this.cleanMove()
    }


    initMove (bbox, pos) {
        this.bbox = Object. assign({}, bbox)
        this.startPos = pos
    }

    cleanMove () {
        delete this.bbox
        delete this.startPos
        delete this.positions
        delete this.handler
        delete this.isResize
        delete this.isMove
    }



}