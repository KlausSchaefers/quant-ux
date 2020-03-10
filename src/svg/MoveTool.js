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
        this.logger.log(-1, 'onClick', 'enter', this.splitPoint)
    }

    onDoubleClick () {
        this.editor.setState('moveDoubleClick')
    }


    onMove (pos) {
        if (this.bbox && this.positions && this.selected) {
            let difX = this.startPos.x - pos.x
            let difY = this.startPos.y - pos.y 
            // this.logger.log(-1, 'onBBoxMouseDown', 'enter', difX + ' ' + difY)

            // update paths
            this.selected.forEach((element,i) => {
                let positions = this.positions[i]
                if (element.type === 'Path') {
                    element.d.forEach((point,j) => {
                        let start = positions[j]
                        point.x = start.x - difX
                        point.y = start.y - difY
                    })
                }
            })

            // update bounding box
            let newBoundingBox = {
                x: this.bbox.x - difX,
                y: this.bbox.y - difY,
                w: this.bbox.w,
                h: this.bbox.h
            }
            this.editor.setBoundingBox(newBoundingBox)
        }
    }

    onBBoxMouseDown (bbox, pos) {
        this.logger.log(-1, 'onBBoxMouseDown', 'enter')
        this.bbox = Object. assign({}, bbox)
        this.startPos = pos
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
        delete this.bbox
        delete this.startPos
        delete this.positions
        this.editor.setCursor('default')
    }

    onBBoxMouseClick () {
    }

   
   
}