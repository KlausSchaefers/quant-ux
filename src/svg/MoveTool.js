import Tool from './Tool'
import Logger from '../common/Logger'

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
        var result = { x: 100000000, y: 100000000, w: 0, h: 0 };

        for (var i = 0; i < boxes.length; i++) {
            var box = boxes[i];
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
                    return {
                        x: point.x,
                        y: point.y
                    }
                })
            }
            return []
        })
        this.editor.setCursor('move')
    }

    onBBoxMouseUp () {
        this.logger.log(-1, 'onBBoxMouseUp', 'enter')
        this.cleanMove()
        this.editor.setCursor('default')
    }

    onBBoxMouseClick () {
    }

    onResizeMouseDown (handler, bbox, pos) {
        this.logger.log(-1, 'onResizeMouseDown', 'enter', handler.type)
        this.initMove(bbox, pos)
        this.positions = this.selected.map(element => {
            if (element.type === 'Path') {
                return element.d.map(point => {
                    return {
                        x: (point.x - bbox.x) / bbox.w,
                        y: (point.y - bbox.y) / bbox.h
                    }
                })
            }
            return []
        })
        this.handler = handler
    }

    onResizeMouseUp(handler, bbox, pos) {
        this.logger.log(-1, 'onResizeMouseUp', 'enter', handler)
        this.cleanMove(bbox, pos)
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
    }

   
   
}