import Tool from './Tool'
import Logger from 'common/Logger'

export default class MorphTool extends Tool{

    constructor (editor, minSplitDistance = 5) {
        super(editor)
        this.minSplitDistance = minSplitDistance
        this.logger = new Logger('MorphTool')
        let selected = this.editor.getSelectedElements()
        if (selected.length === 1) {
            this.selected = selected[0]
            this.svgPath = this.editor.getSVGElement(this.selected)
            if (!this.svgPath) {
                this.logger.log(-1, 'constructor', 'No SVG path')
            }
            // what happends if this is not a path?
        } else {
            this.logger.error('constructor', 'Selection is not 1')
        }
    }

    onClick() {
        this.logger.log(-1, 'onClick', 'enter', this.splitPoint)
        if (this.splitPoint) {

            this.split(this.splitPoint, this.selected)
        } else if (!this.movePoint) {
            this.editor.setState('morphEnd')
        } else {
            this.editor.onChange()
        }
    }

    split (pos, path) {
        this.logger.log(-1, 'split', 'enter' , pos, path)
        // This is a nice riddle....
        // just search in the segmens which one is closer?
        // or add this already to the getClosest?
    }

    onMove (pos) {
        if (this.movePoint) {
            this.movePoint.x = pos.x
            this.movePoint.y = pos.y
            this.canAdd = false
        } else {
            let distanceToOherPoints = this.getDistanceToOtherPoints(pos, this.selected)
            if (this.svgPath ) {
                let splitPoint = this.getClosesetPoint(pos, this.svgPath )
                if (splitPoint && splitPoint.distance < 5) {
                    
                    let minDistance = Math.sqrt(Math.min(...distanceToOherPoints))
                    if (minDistance > this.minSplitDistance) {
                        this.editor.setSplitPoint(splitPoint)
                        this.splitPoint = splitPoint
                        this.canAdd = false
                        return
                    }
                    
                } 
                this.editor.setSplitPoint()
                this.splitPoint = null
            }

            if (this.canAdd) {
                // check her also
                // add somehow new path like in sketch, unless we have once splitted or moved
            }
        }
        //console.debug('onMove', point)
       // calculate the closest point
       // https://bl.ocks.org/mbostock/8027637
    }

    getDistanceToOtherPoints (pos, path) {
        return path.d.map(p => {
            let dx = p.x - pos.x
            let dy = p.y - pos.y
            return dx * dx + dy * dy;
        })
    }

    getClosesetPoint(pos, pathNode) {
        // copied from https://bl.ocks.org/mbostock/8027637
        // FIXME: maybe implement here some stupid brute force thing with random sampling?
        // GNU license!
        var pathLength = pathNode.getTotalLength(),
        precision = 8,
        best,
        bestLength,
        bestDistance = Infinity;
    
        // linear scan for coarse approximation
        for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
            if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                best = scan, bestLength = scanLength, bestDistance = scanDistance;
            }
        }
    
        // binary search for precise estimate
        precision /= 2;
        while (precision > 0.5) {
            var before,
                after,
                beforeLength,
                afterLength,
                beforeDistance,
                afterDistance;
            if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                best = before, bestLength = beforeLength, bestDistance = beforeDistance;
            } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                best = after, bestLength = afterLength, bestDistance = afterDistance;
            } else {
                precision /= 2;
            }
        }
    
        best = {
            x: best.x, 
            y: best.y,
            distance: Math.sqrt(bestDistance)
        }
        return best;
    
        function distance2(p) {
            var dx = p.x - pos.x,
                dy = p.y - pos.y;
            return dx * dx + dy * dy;
        }
    }

    onDoubleClick () {
        this.editor.setState('addEnd')
    }

    onJointMouseDown(joint){
        this.logger.log(-1, 'onJointMouseDown', 'enter',joint)
        let path = this.editor.getElementById(joint.parent)
        if (path) {
            let point = path.d[joint.id]
            if (point) {
                this.movePoint = point
            } else {
                this.logger.error('onJointMouseDown', 'not point',joint)
            }
        } else {
            this.logger.error('onJointMouseDown', 'not parent',joint)
        }
    }

    onJointMouseUp(joint){
        this.logger.log(-1, 'onJointMouseUp', joint)
        delete this.movePoint
    }

}