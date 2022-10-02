import Tool from './Tool'
import Logger from 'common/Logger'

export default class MorphTool extends Tool{

    constructor (editor, minSplitDistance = 5, minShowSplitDistance = 10) {
        super(editor)
        this.minSplitDistance = minSplitDistance
        this.minShowSplitDistance = minShowSplitDistance
        this.logger = new Logger('MorphTool')
        let selectedElements = this.editor.getSelectedElements()
        this.showSplitPoint = false
        if (selectedElements.length === 1) {
            this.selectedElement = selectedElements[0]
            this.svgPath = this.editor.getSVGElement(this.selectedElement)
            if (!this.svgPath) {
                this.logger.log(-1, 'constructor', 'No SVG path')
            }
            // what happends if this is not a path?
        } else {
            this.logger.error('constructor', 'Selection is not 1')
        }
    }

    /**
     * Implement some state machine:
     *
     * 1) If we have a split point, split
     *
     * 2) If we have a selected joint, remove selection
     *
     * 3) If we have no selectedJoint, end the tool
     *
     */
    onClick() {
        this.logger.log(1, 'onClick', 'enter', this.splitPoint)
        if (this.splitPoint) {
            this.split(this.splitPoint, this.selectedElement, this.svgPath)
        } else if (this.selectedJoint) {
            delete this.selectedJoint
            this.editor.setSelectedJoint()
        } else if (!this.selectedJoint) {
            this.editor.setState('morphEnd')
        }
    }

    onDoubleClick () {
        this.editor.setState('morphEnd')
    }

    split (pos, path, svg) {
        this.logger.log(5, 'split', 'enter' , pos, path)

        // now scan once backwards to find point before.
        const start =  this.getSplitStart(path, pos, svg)
        if (start >= 0) {
            // add *after* the start
            this.logger.log(-1, 'split', 'exit > add at' , start + 1)
            /** FIXME: If we have a curve we should to other splitting */
            path.d.splice(start + 1, 0, {
                t: 'L',
                x: Math.round(pos.x),
                y: Math.round(pos.y)
            })
            this.editor.setSplitPoint()
            this.editor.setSelectedJoint({
                id: start + 1
            })
        }
        this.editor.onChange()
    }


    onMove (pos) {
        if (this.selectedBezier) {
            const point = this.selectedElement.d[this.selectedBezier.parent]
            if (point) {
                if (this.selectedBezier.isX1) {
                    point.x1 = pos.x
                    point.y1 = pos.y
                } else {
                    point.x2 = pos.x
                    point.y2 = pos.y
                }
            } else {
                this.logger.log(-1, 'onMove', 'No point in selected path', this.selectedBezier)
            }

        } else if (this.selectedJoint) {
            this.selectedJoint.x = pos.x
            this.selectedJoint.y = pos.y
            this.canAdd = false
            /** FIXME: update the bezier points */
        } else {
            if (this.showSplitPoint) {
                const distanceToOherPoints = this.getDistanceToOtherPoints(pos, this.selectedElement)
                if (this.svgPath) {
                    const splitPoint = this.getClosesetPoint(pos, this.svgPath, this.selectedElement)
                    if (splitPoint && splitPoint.distance < this.minShowSplitDistance) {
                        const minDistance = Math.sqrt(Math.min(...distanceToOherPoints))
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
            }

            if (this.canAdd) {
                // check her also
                // add somehow new path like in sketch, unless we have once splitted or moved
            }
        }
        //console.debug('onMove', point)
       // calculate the closest point
       //
    }

    getDistanceToOtherPoints (pos, path) {
        return path.d.map(p => {
            const dx = p.x - pos.x
            const dy = p.y - pos.y
            return dx * dx + dy * dy;
        })
    }

    getClosesetPoint (pos, svg) {
        var length = svg.getTotalLength()
        let minDistance =  Infinity
        let minIndex = -1
        let result = null

        // FIXME: this is brute force.
        // we could for instance take bigger steps (8),
        // save these as candidates and the look for each
        // of the candidates 8 forward and backwards...
        for (let i = 0; i < length; i++) {
            const p = svg.getPointAtLength(i)
            const d = distance(p, pos)
            if (d < minDistance) {
                minIndex = i
                minDistance = d
                result = p
            }
        }

        result.distance = Math.sqrt(minDistance)
        result.index = minIndex

        return result
    }

    getSplitStart (path, pos, svg) {
        /**
         * Build lookup map to check fast for all points
         * which was the split start
         */
         const points = {}
        path.d.forEach((p,i) => {
            if (!points[p.x]) {
                points[p.x] = {}
            }
            if (!points[p.x-1]) {
                points[p.x-1] = {}
            }
            if (!points[p.x+1]) {
                points[p.x+1] = {}
            }
            points[p.x][p.y] = i
            points[p.x][p.y-1] = i
            points[p.x][p.y+1] = i

            points[p.x-1][p.y] = i
            points[p.x-1][p.y-1] = i
            points[p.x-1][p.y+1] = i

            points[p.x+1][p.y] = i
            points[p.x+1][p.y-1] = i
            points[p.x+1][p.y+1] = i
        })

        /**
         * Check for all points before which is the closest
         * path point.
         */
        let start = -1
        for (let i = pos.index; i >= 0; i--) {
            const p = svg.getPointAtLength(i)
            const xf = Math.floor(p.x)
            const yf = Math.floor(p.y)
            const xc = Math.ceil(p.x)
            const yc = Math.ceil(p.y)
            if (points[xf] && points[xf][yf] >= 0 ){
                start = points[xf][yf]
                break
            }
            if (points[xf] && points[xf][yc] >= 0) {
                start = points[xf][yc]
                break
            }
            if (points[xc] && points[xc][yc] >= 0) {
                start = points[xc][yc]
                break
            }
            if (points[xc] && points[xc][yf] >= 0) {
                start = points[xc][yf]
                break
            }
        }
        return start
    }

    onJointMouseDown(joint){
        this.logger.log(1, 'onJointMouseDown', 'enter',joint)
        const path = this.editor.getElementById(joint.parent)
        if (path) {
            const point = path.d[joint.id]
            this.editor.setSelectedJoint(joint)
            if (point) {
                this.selectedJoint = point
                this.editor.setCursor('move')
            } else {
                this.logger.error('onJointMouseDown', 'not point',joint)
            }
        } else {
            this.logger.error('onJointMouseDown', 'not parent',joint)
        }
    }

    onJointMouseUp(joint){
        this.logger.log(5, 'onJointMouseUp', 'enter', joint)
        delete this.selectedJoint
        this.editor.onChange()
        this.editor.setCursor('default')
    }

    onJointClick (joint) {
        this.logger.log(1, 'onJointClick', 'enter', joint)
        this.selectedJoint = joint
        this.editor.setSelectedJoint(joint)
    }


    onBezierMouseDown (bezierPoint) {
        this.logger.log(1, 'onBezierMouseDown', 'enter', bezierPoint)
        this.selectedBezier = bezierPoint
        this.editor.setSelectedBezier(bezierPoint)
        this.editor.setCursor('move')
    }

    onBezierMouseUp () {
        this.logger.log(1, 'onBezierMouseUp', 'enter')
        delete this.selectedBezier
        this.editor.onChange()
        this.editor.setSelectedBezier()
        this.editor.setCursor('default')
    }

    onBezierClick () {}


}


function distance(a, b) {
    const dx = a.x - b.x,
        dy = a.y - b.y;
    return dx * dx + dy * dy;
}