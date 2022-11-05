import Tool from './Tool'
import Logger from 'common/Logger'
import on from 'dojo/on'
import win from 'dojo/_base/win'
import * as SVGUtil from '../SVGUtil'

let showSplitPoint = true


export default class MorphTool extends Tool{

    constructor (editor, minSplitDistance = 16, minShowSplitDistance = 8, syncBezier = true) {
        super(editor)
        this.logger = new Logger('MorphTool')
        this.minSplitDistance = minSplitDistance
        this.minShowSplitDistance = minShowSplitDistance
        this.splitSegmentSize = 10
        this.isSyncBezier = syncBezier

        let selectedElements = this.editor.getSelectedElements()
        if (selectedElements.length === 1) {
            this.selectedElement = selectedElements[0]
            this.svgPath = this.editor.getSVGElement(this.selectedElement)
            if (!this.svgPath) {
                this.logger.log(-1, 'constructor', 'No SVG path')
            }
            this.isBezier = this.selectedElement.d.every(p => p.t === 'C' || p.t === 'M')
            // what happends if this is not a path?
        } else {
            this.logger.error('constructor', 'Selection is not 1')
        }
        this.initSplitSegments()
    }

    onPathChanged () {
        this.editor.onChange()
        this.initSplitSegments()
    }


    onZoom (zoom) {
        this.zoom = zoom
        this.initSplitSegments()
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
        this.logger.log(3, 'onClick', 'enter > split:', this.splitPoint + ' > joint:' + this.isJointDown)
        
        this.endRuler()
        if (this.isJointDown) {
            this.onJointMouseUp()            
            return
        }

       
        
        delete this.selectedJoints
        this.editor.setSelectedJoints()
        
    }

    onDelete () {
        if (this.selectedJoints) {
            const ids = new Set(this.selectedJoints.map(j => j.id))
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
           this.editor.setSplitPoints()
           return
        } 
        
        if (this.isJointDown && this.selectedJoints) {
            this.moveJoint(pos)
            this.editor.setSplitPoints()
            return
        } 
        
        if (this.isSelectionStarted()) {
            this.moveSelect(pos)
            this.editor.setSplitPoints()
            return
        }
        
        this.showSplit(pos)
    }

    moveJoint (pos) {
        if (!this.selectedJointStartPos) {
            return
        }
        const difX = this.selectedJointStartPos.x - pos.x
        const difY = this.selectedJointStartPos.y - pos.y
        const path = this.selectedElement
        const startPath = this.selectedJointStartPath
        this.selectedJoints.forEach(joint => {
            const point = path.d[joint.id]
            const start = startPath.d[joint.id]
            if (point && start) {
                point.x = start.x - difX
                point.y = start.y - difY
          
                // FIXME: should we somehow save this?

                if (!pos.altKey) {
                    if (point.t === 'C') {
                        point.x2 = start.x2 - difX
                        point.y2 = start.y2 - difY
                    }
                    const next = path.d[joint.id + 1]
                    const nextStart = startPath.d[joint.id + 1] 
                    if (next && next.t === 'C' && nextStart) {
                        next.x1 = nextStart.x1 - difX
                        next.y1 = nextStart.y1 - difY
                    }
                }

            }
        
        })
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
            // FIXME: Check if the points are on a line...
            if (!pos.altKey && this.selectedBezierSlopeIsDifferent) {

              
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
        this.logger.log(3, 'onJointMouseDown', 'enter',joint)
        const path = this.editor.getElementById(joint.parent)
        this.isJointDown = true
 
        this.selectedJointStartPath = SVGUtil.clone(this.selectedElement)
        if (path) {
            const point = path.d[joint.id]
            this.selectedJointStartPos = {
                x: point.x,
                y: point.y
            }
            if (point) {
                // FIXME: add here some stuff to move mutli selection
                const startPoint = {
                    id: joint.id
                }
                this.editor.setCursor('move')
                if (pos.shiftKey && this.selectedJoints && this.selectedJoints.length > 0) {
                    this.selectedJoints.push(startPoint)
                    this.editor.addSelectedJoint(joint)
                    this.editor.startRuler(path, [joint.id])
                } else {
                    this.selectedJoints = [startPoint]
                    this.editor.setSelectedJoints([joint])
                    this.editor.startRuler(path, [joint.id])
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
        delete this.selectedJointStartPos
        delete this.selectedJointStartPath
     
        this.editor.endRuler()
        this.editor.setCursor('default')
        this.onPathChanged()
    }

    onJointClick (joint) {
        this.logger.log(3, 'onJointClick', 'enter', joint)
    }


    onBezierMouseDown (bezierPoint) {
        this.logger.log(3, 'onBezierMouseDown', 'enter', bezierPoint)
        this.selectedBezier = bezierPoint
        this.selectedBezierDistance = SVGUtil.getBezierDistance(this.selectedElement, bezierPoint)
        const slopes = SVGUtil.getBezierSlopes(this.selectedElement, bezierPoint)
        this.selectedBezierSlopeIsDifferent = Math.abs(slopes.x1 - slopes.x2) < 0.05
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
        this.editor.setSelectedBezier()
        this.editor.setCursor('default')
        this.onPathChanged()
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
                this.selectedJoints = inBox.map(p => {
                    return {
                        id: p.id
                    }
                })
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
        if (!showSplitPoint || this.isBezier) {
            return
        }

        const distanceToOherPoints = this.getDistanceToOtherPoints(pos, this.selectedElement)
        const minDistance = Math.sqrt(Math.min(...distanceToOherPoints))
        // check that we are not close to one of the joints
        if (minDistance > this.minSplitDistance) {
            // do the chekcing on zoomed space
            const zoomedPos = SVGUtil.getZoomedBox(pos, this.zoom)  
            if (this.svgPath) {
                const splitPoint = this.getClosesetPoint(zoomedPos, this.svgPath, this.selectedElement)
                if (splitPoint && splitPoint.distance < this.minShowSplitDistance) {               
                        this.editor.setSplitPoints([splitPoint])
                        this.splitPoint = splitPoint
                        this.canAdd = false
                        return                
                }
                this.editor.setSplitPoints()
                this.splitPoint = null
            }
        } else {
            this.editor.setSplitPoints()
            this.splitPoint = null
        }

      
    }

    onSplitPointClick (splitPoint, pos) {
        this.logger.log(-2, 'onSplitPointClick', 'enter' , splitPoint, pos)
        this.split(pos, this.splitPoint, this.selectedElement, this.svgPath)     
        
    }
   
    split (pos, splitPoint, path, svg) {
        this.logger.log(5, 'split', 'enter' , splitPoint, path)

        // now scan once backwards to find point before.
        const start =  this.getSplitStart(path, splitPoint, svg)
        if (start >= 0) {
            this.logger.log(-1, 'split', 'exit > add at' , start + 1)
            const slope = SVGUtil.getBezierSlope(svg, splitPoint.index)
            // unzoom the split point. 
            const unZoomedSplitPoint = SVGUtil.getUnZoomedBox(splitPoint, this.zoom)
            SVGUtil.splitPathAt(path, start, unZoomedSplitPoint, slope)
            this.editor.setSplitPoints()
            this.editor.setSelectedJoints([{
                id: start + 1
            }])
            this.onPathChanged()
        } else {
            this.logger.warn('split', 'cannot find split point', splitPoint, path)
        }
     
    }

    getSplitStart (path, pos, svg) {
        /**
         * Build lookup map to check fast for all points
         * which was the split start. Because of rounding
         * errors we also set +/- 1
         */
        const points = {}
        path.d.forEach((p,i) => {
            const x = Math.round(p.x * this.zoom)
            const y = Math.round(p.y * this.zoom)
            if (!points[x]) {
                points[x] = {}
            }
            if (!points[x-1]) {
                points[x-1] = {}
            }
            if (!points[x+1]) {
                points[x+1] = {}
            }
            points[x][y] = i
            points[x][y-1] = i
            points[x][y+1] = i

            points[x-1][y] = i
            points[x-1][y-1] = i
            points[x-1][y+1] = i

            points[x+1][y] = i
            points[x+1][y-1] = i
            points[x+1][y+1] = i
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

    initSplitSegments () {
        if (!showSplitPoint || !this.svgPath) {
            return
        }
        // we cache here already the segments in the path, 
        // so the realtime lookup is faster
        this.logger.log(2, 'initSplitSegments', 'enter')
        this.svgPath = this.editor.getSVGElement(this.selectedElement)   
        const length = this.svgPath.getTotalLength()
        this.splitSegements = []
        for (let i = 0; i < length; i+= this.splitSegmentSize) {       
            const p = this.svgPath.getPointAtLength(i)               
            this.splitSegements.push({
                p:p,
                index:i
            })
        }
    }


    getClosesetPoint (pos, svg) {

        let minDistance =  Infinity
        let minIndex = -1
        const startMS = new Date().getTime()
        for (let i=0; i < this.splitSegements.length; i++) {
            const p = this.splitSegements[i].p
            const d = distance(p, pos)
            if (d < minDistance) {
                minIndex = this.splitSegements[i].index
                minDistance = d
            }
        }
        const result = this.getClosesetPointInSegment(pos, svg, minIndex)

        // if this is too slow we disbale for this session
        const endMS = new Date().getTime()
        if (endMS - startMS > 50) {
            this.logger.error('getClosesetPoint', 'disable split points because to slow >> ' + (endMS - startMS ))
            this.logger.sendError(new Error())
            showSplitPoint = false
        }
        return result
    }

    getClosesetPointInSegment (pos, svg, segmentIndex) {
        const length = svg.getTotalLength()
        const start = Math.max(0, segmentIndex - this.splitSegmentSize)
        const end = Math.min(length, segmentIndex + this.splitSegmentSize)

        let minDistance =  Infinity
        let minIndex = -1
        let result = null

        for (let i = start; i < end; i++) {
            const p = svg.getPointAtLength(i)
            const d = distance(p, pos)
            if (d < minDistance) {
                minIndex = i
                minDistance = d
                result = p
            }
        }

        if (result) {
            result.distance = Math.sqrt(minDistance)
            result.index = minIndex
        }

        return result
    }

    

}


function distance(a, b) {
    const dx = a.x - b.x,
        dy = a.y - b.y;
    return dx * dx + dy * dy;
}