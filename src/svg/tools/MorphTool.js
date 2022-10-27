import Tool from './Tool'
import Logger from 'common/Logger'
import on from 'dojo/on'
import win from 'dojo/_base/win'
import * as SVGUtil from '../SVGUtil'


export default class MorphTool extends Tool{

    constructor (editor, minSplitDistance = 8, minShowSplitDistance = 16, syncBezier = true) {
        super(editor)
        this.logger = new Logger('MorphTool')
        this.minSplitDistance = minSplitDistance
        this.minShowSplitDistance = minShowSplitDistance
        this.showSplitPoint = false
        this.isSyncBezier = syncBezier

        let selectedElements = this.editor.getSelectedElements()
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
        this.logger.log(3, 'onClick', 'enter', this.selectedJoints)
        if (this.splitPoint) {
            this.split(this.splitPoint, this.selectedElement, this.svgPath)
        } else {
            delete this.selectedJoints
            delete this.selectedJointsIds
            this.editor.setSelectedJoints()
        }
    }

    onDelete () {
        if (this.selectedJointsIds) {
            const ids = new Set(this.selectedJointsIds)
            this.selectedElement.d = this.selectedElement.d.filter((p,i) => {
                return !ids.has(i)
            })
            if (this.selectedElement.d.length < 2) {
                this.editor.deleteSelection()
            }
        }
    }

    onDoubleClick () {
        this.logger.log(-3, 'onDoubleClick', 'enter', this.selectedJoints)
        this.editor.setState('morphEnd')
    }



    onMove (pos) {
        if (this.selectedBezier) {
           this.moveBezier(pos)
        } 
        
        if (this.isJointDown && this.selectedJoints) {
            this.moveJoint(pos)
        } 
        
        if (this.isSelectionStarted()) {
            this.moveSelect(pos)
        }
        
        this.showSplit(pos)
   

        if (this.canAdd) {
            // check her also
            // add somehow new path like in sketch, unless we have once splitted or moved
        }
        
        //console.debug('onMove', point)
       // calculate the closest point
       //
    }

    moveJoint (pos) {
        this.selectedJoints.forEach(joint => {
            joint.x = pos.x
            joint.y = pos.y
        })
        this.canAdd = false
        return
    }

    moveBezier (pos) {
        const point = this.selectedElement.d[this.selectedBezier.parent]
        if (point) {
            if (this.selectedBezier.isX1) {
                point.x1 = pos.x
                point.y1 = pos.y
            } else {
                point.x2 = pos.x
                point.y2 = pos.y
            }

            if (this.isSyncBezier) {
                const previous = this.selectedElement.d[this.selectedBezier.parent-1]
                const next = this.selectedElement.d[this.selectedBezier.parent+1]
                // in case of X1, we have to get the previous X2
                if (this.selectedBezier.isX1 && previous && this.selectedBezierDistance.x2) {
                    const difX1 = point.x1 - previous.x
                    const difY1 = point.y1 - previous.y
                    const len1 = Math.sqrt(difX1 * difX1 + difY1 * difY1)
                    const f = this.selectedBezierDistance.x2 / len1
                    previous.x2 = Math.round(previous.x - difX1 * f)
                    previous.y2 = Math.round(previous.y - difY1 * f)
                }
                // in case of X2 , we move the next X1 around the current point
                if (this.selectedBezier.isX2 && next && this.selectedBezierDistance.x1) {
                    const difX2 = point.x2 - point.x
                    const difY2 = point.y2 - point.y
                    const len2 = Math.sqrt(difX2 * difX2 + difY2 * difY2)
                    const f = this.selectedBezierDistance.x1 / len2
                    next.x1 = point.x - Math.round(difX2 * f)
                    next.y1 = point.y - Math.round(difY2 * f)
                }
            
            }
        } else {
            this.logger.log(-1, 'onMove', 'No point in selected path', this.selectedBezier)
        }
        return
    }


    moveSelect (point) {
        if (this._isSelectStarted && this._selectStart) {
            this._selectBox = this.getBox(this._selectStart, point)
            const zoomedBox = SVGUtil.getZoomedBox(this._selectBox, this.zoom)
            this.editor.setSelectBox(zoomedBox)
        }
    }
  


    onJointMouseDown(joint, pos){
        this.logger.log(-3, 'onJointMouseDown', 'enter',joint)
        const path = this.editor.getElementById(joint.parent)
        this.isJointDown = true
        if (path) {
            const point = path.d[joint.id]
            if (point) {
                // add here some stuff to move mutli selection
                this.editor.setCursor('move')
                if (pos.shiftKey && this.selectedJoints && this.selectedJoints.length > 0) {
                    this.selectedJoints.push(point)
                    this.selectedJointsIds.push(joint.id)
                    this.editor.addSelectedJoint(joint)   
                } else {
                    this.selectedJoints = [point]
                    this.selectedJointsIds = [joint.id]
                    this.editor.setSelectedJoints([joint])     
                }
            } else {
                this.logger.error('onJointMouseDown', 'not point',joint)
                this.setSelectedBezier()
            }
        } else {
            this.logger.error('onJointMouseDown', 'not parent',joint)
        }
    }

    onJointMouseUp(joint){
        this.logger.log(3, 'onJointMouseUp', 'enter', joint)
        this.isJointDown = false
        this.editor.onChange()
        this.editor.setCursor('default')
    }

    onJointClick (joint) {
        this.logger.log(3, 'onJointClick', 'enter', joint)
    }


    onBezierMouseDown (bezierPoint) {
        this.logger.log(3, 'onBezierMouseDown', 'enter', bezierPoint)
        this.selectedBezier = bezierPoint
        this.selectedBezierDistance = SVGUtil.getBezierDistance(this.selectedElement, bezierPoint)
        this.editor.setSelectedBezier(bezierPoint)
        this.editor.setCursor('move')
    }

    // onBezierMouseOver (bezierPoint) {
    //     let distances = SVGUtil.getBezierDistance(this.selectedElement, bezierPoint)
    //     console.debug(' => len2 :',distances)
    // }

    onBezierMouseUp () {
        this.logger.log(3, 'onBezierMouseUp', 'enter', this.selectedJoint)
        delete this.selectedBezier
        delete this.selectedBezierDistance
        this.editor.onChange()
        this.editor.setSelectedBezier()
        this.editor.setCursor('default')
    }

    onBezierClick () {}

    onMouseDown (point) {
        this.logger.log(5, 'onMouseDown', 'enter', point)
        this._isSelectStarted = true
        this._selectStart = point
        this._selectionToolUpListener = on(win.body(),"mouseup", () => this.onMouseUp() );
    }

    onMouseUp(point) {
        this.logger.log(5, 'onMouseUp', 'enter', point)
        if (this._isSelectStarted && this._selectBox) {
            const selectBox = this._selectBox
            const inBox = this.selectedElement.d
                .map((p,i) => {
                    return {
                        joint :p,
                        x: p.x,
                        y: p.y,
                        id: i
                    }
                })
                .filter(p => SVGUtil.isPointInBox(p, selectBox))
     
            if (inBox.length > 0) {
                this.editor.setSelectedJoints(inBox)
                this.selectedJoints = inBox.map(p => p.joint)
                this.selectedJointsIds = inBox.map(p => p.id)
            }
        }
        this.clearSelect()
    }


    isSelectionStarted () {
        return this._isSelectStarted
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

    showSplit(pos) {
        if (!this.showSplitPoint) {
            return
        }
        const distanceToOherPoints = this.getDistanceToOtherPoints(pos, this.selectedElement)
        if (this.svgPath) {
            const splitPoint = this.getClosesetPoint(pos, this.svgPath, this.selectedElement)
            if (splitPoint && splitPoint.distance < this.minShowSplitDistance) {
                const minDistance = Math.sqrt(Math.min(...distanceToOherPoints))
                if (minDistance > this.minSplitDistance) {
                    this.editor.setSplitPoints([splitPoint])
                    this.splitPoint = splitPoint
                    this.canAdd = false
                    return
                }
            }
            this.editor.setSplitPoints()
            this.splitPoint = null
        }
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
            this.editor.setSplitPoints()
            this.editor.setSelectedJoints([{
                id: start + 1
            }])
        }
        this.editor.onChange()
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

    getDistanceToOtherPoints (pos, path) {
        return path.d.map(p => {
            const dx = p.x - pos.x
            const dy = p.y - pos.y
            return dx * dx + dy * dy;
        })
    }

    getClosesetPoint (pos, svg) {
        const length = svg.getTotalLength()
        let minDistance =  Infinity
        let minIndex = -1
        let result = null

        // FIXME: this is brute force.
        // we could for instance take bigger steps (8),
        // save these as candidates and the look for each
        // of the candidates 8 forward and backwards...
        // https://bl.ocks.org/mbostock/8027637
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

    

}


function distance(a, b) {
    const dx = a.x - b.x,
        dy = a.y - b.y;
    return dx * dx + dy * dy;
}