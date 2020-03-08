import Tool from './Tool'
import Logger from 'common/Logger'

export default class MorphTool extends Tool{

    constructor (editor, minSplitDistance = 5, minShowSplitDistance = 10) {
        super(editor)
        this.minSplitDistance = minSplitDistance
        this.minShowSplitDistance = minShowSplitDistance
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
            this.split(this.splitPoint, this.selected, this.svgPath)
        } else if (!this.movePoint) {
            this.editor.setState('morphEnd')
        } else {
            this.editor.onChange()
        }
    }

    split (pos, path, svg) {
        this.logger.log(5, 'split', 'enter' , pos, path)

        // look for end, from index to end,
        let points = {}
        path.d.forEach((p,i) => {
            if (!points[p.x]) {
                points[p.x] = {}
            }
            points[p.x][p.y] = i
        })

        // now scan once backwards to find point before.
        let start =  this.getSplitStart(points, pos, svg)
        if (start >= 0) {
            // add *after* the start
            this.logger.log(-1, 'split', 'exit > add at' , start + 1)
            path.d.splice(start + 1, 0, {
                t: 'L',
                x: Math.round(pos.x),
                y: Math.round(pos.y)
            })
            this.editor.setSplitPoint()
        }
    }


    onMove (pos) {
        if (this.movePoint) {
            this.movePoint.x = pos.x
            this.movePoint.y = pos.y
            this.canAdd = false
        } else {
            let distanceToOherPoints = this.getDistanceToOtherPoints(pos, this.selected)
            if (this.svgPath ) {
                let splitPoint = this.getClosesetPoint(pos, this.svgPath, this.selected)
                if (splitPoint && splitPoint.distance < this.minShowSplitDistance) {

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
       //
    }

    getDistanceToOtherPoints (pos, path) {
        return path.d.map(p => {
            let dx = p.x - pos.x
            let dy = p.y - pos.y
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
            let p = svg.getPointAtLength(i)
            let d = distance(p, pos)
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

    getSplitStart (points, pos, svg) {
        let start = -1
        for (let i = pos.index; i >= 0; i--) {
            let p = svg.getPointAtLength(i)
            let xf = Math.floor(p.x)
            let yf = Math.floor(p.y)
            let xc = Math.ceil(p.x)
            let yc = Math.ceil(p.y)
            if (points[xf] && points[xf][yf] >= 0 ){
                start = points[xf][yf]
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
            if (points[xf] && points[xf][yc] >= 0) {
                start = points[xf][yc]
                break
            }
        }
        return start
    }

    getSplitEnd (points, pos, svg) {
        var length = svg.getTotalLength()
        let end = -1
        for (let i = pos.index; i < length; i++) {
            let p = svg.getPointAtLength(i)
            let xf = Math.floor(p.x)
            let yf = Math.floor(p.y)
            let xc = Math.ceil(p.x)
            let yc = Math.ceil(p.y)
            if (points[xf] && points[xf][yf] >= 0 ){
                end = points[xf][yf]
                break
            }
            if (points[xc] && points[xc][yc] >= 0) {
                end = points[xc][yc]
                break
            }
            if (points[xc] && points[xc][yf] >= 0) {
                end = points[xc][yf]
                break
            }
            if (points[xf] && points[xf][yc] >= 0) {
                end = points[xf][yc]
                break
            }
        }
        return end
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


function distance(a, b) {
    var dx = a.x - b.x,
        dy = a.y - b.y;
    return dx * dx + dy * dy;
}