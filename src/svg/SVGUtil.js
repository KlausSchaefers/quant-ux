const includeStroke = true

export function rotate(path, angle) {
    const [centerX, centerY] = getRotationCenter(path)
    const matrix = new DOMMatrix()
        .translate(centerX, centerY, 0)
        .rotate(angle)
        .translate(-1 * centerX, -1 * centerY, 0)
   
    path.d.forEach(p => {
        const point = new DOMPoint(p.x, p.y)
        const newPoint = matrix.transformPoint(point)
        p.x = newPoint.x
        p.y = newPoint.y
        
        if (p.t === 'C') {
            const point1 = new DOMPoint(p.x1, p.y1)
            const newPoint1 = matrix.transformPoint(point1)
            p.x1 = Math.round(newPoint1.x) 
            p.y1 = Math.round(newPoint1.y) 
         
            const point2 = new DOMPoint(p.x2, p.y2)
            const newPoint2 = matrix.transformPoint(point2)
            p.x2 = Math.round(newPoint2.x) 
            p.y2 = Math.round(newPoint2.y) 
        }
    })
}

export function getRotationCenter (path) {
    // compute the centroid of all points
    let sumX = 0
    let sumY = 0
    path.d.forEach(p => { 
        sumX += p.x
        sumY += p.y
    })
    const centerY = sumY / path.d.length 
    const centerX = sumX / path.d.length
    return [centerX, centerY]
}


export function changePathOrder(paths, fromPathId, toPathId) {
    const fromIndex = paths.findIndex(p => p.id === fromPathId)
    let toIndex = paths.findIndex(p => p.id === toPathId)
    if (fromIndex < 0 || toIndex < 0) {
        console.warn('SVGUtil.changePathOrder() > could not find noth paths', fromIndex, toIndex)
        return paths
    }
    const fromPath = paths.splice(fromIndex, 1)[0]
    toIndex = paths.findIndex(p => p.id === toPathId)
    paths.splice(toIndex +1 , 0 , fromPath)
    return paths
}

export function moveSelectedPathToTop (paths, ids) {
    const rest = []
    const selected = []
    paths.forEach(p => {
        if (ids.indexOf(p.id) >=0) {
            selected.push(p)
        } else {
            rest.push(p)
        }
    })
    return rest.concat(selected)
}

export function moveSelectedPathToBottom(paths, ids) {
    const rest = []
    const selected = []
    paths.forEach(p => {
        if (ids.indexOf(p.id) >=0) {
            selected.push(p)
        } else {
            rest.push(p)
        }
    })
    return selected.concat(rest)
}


export function getRelativePaths (bbox, selected) {
    return selected.map(element => {
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
}


export function getZoomedPaths(paths, zoom) {
    const result = clone(paths)
    for (let path of result) {
        const points = path.d
        path.strokeWidth = path.strokeWidth * zoom
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            point.x = Math.round(point.x * zoom)
            point.y = Math.round(point.y * zoom)
            if (point.t === 'C') {
                point.x1 = Math.round(point.x1 * zoom)
                point.y1 = Math.round(point.y1 * zoom)
                point.x2 = Math.round(point.x2 * zoom)
                point.y2 = Math.round(point.y2 * zoom)
            }
        }
    }

    return result
}

export function getZoomedBox(box, zoom) {
    return {
        x: Math.round(box.x * zoom),
        y: Math.round(box.y * zoom),
        w: Math.round(box.w * zoom),
        h: Math.round(box.h * zoom),
        zoom: zoom
    }
}

export function getUnZoomedBox(box, zoom) {
    return {
        x: Math.round(box.x / zoom),
        y: Math.round(box.y / zoom),
        w: Math.round(box.w / zoom),
        h: Math.round(box.h / zoom),
        zoom: zoom
    }
}

export function addPadding(box, padding = 1) {
    return {
        x: box.x - padding,
        y: box.y - padding,
        w: box.w + padding,
        h: box.h + padding
    }
}

export function isPathInBox (path, box) {
    return path.d.every(p => {
       
        return p.x >= box.x && 
                p.x <= box.x + box.w && 
                p.y >= box.y && 
                p.y <= box.y + box.h
    })
}

export function isPointInBox (p, box) {
    return p.x >= box.x && 
            p.x <= box.x + box.w && 
            p.y >= box.y && 
            p.y <= box.y + box.h
}

export function closePath (d, snapp = 5) {
    if (d.length < 2) {
        return
    }
    const first = d[0]
    const last = d[d.length-1]
    const difX = Math.abs(first.x - last.x)
    const difY = Math.abs(first.y - last.y)
    if (difX <= snapp && difY <= snapp) {
        last.t = 'Z'
    }
}

export function pathToSVG (d, offsetX =0, offsetY = 0, closed = false) {
  let path = d.map(point => {
      if (point.t === 'C' || point.t === 'CZ') {
        return `C ${point.x1 + offsetX} ${point.y1 + offsetY}, ${point.x2 + offsetX} ${point.y2 + offsetY}, ${point.x + offsetX} ${point.y + offsetY}`
      }
      if (point.t === 'Z') {
        return `Z`
      }
      return `${point.t} ${point.x + offsetX} ${point.y + offsetY}`
  }).join(' ')
  if (closed && d.length > 0) {
    path += 'Z'
  }
  return path
}

export function getBBox(element) {
    return element.getBBox({stroke: includeStroke}) // does not have an effect
}

export function getBBoxes(elements) {
    const result = []
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        result.push(getBBox(element))
    }
    return result
}


export function getBoundingBoxByBoxes (boxes) {
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

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

export function isValidPaths (paths) {
    if (paths.length === 0) {
        return false
    }
    for (let path of paths) {
        if (path.d.length === 0) {
            return false
        }
    }
    return true
}

export function strechPaths(paths, sourceBox, currentBox) {
    if (sourceBox.w === currentBox.w && sourceBox.h === currentBox.h) {
        return paths
    }
    const result = clone(paths)
    const scaleW = currentBox.w / sourceBox.w
    const scaleH = currentBox.h / sourceBox.h
 
    result.forEach(path => {
        const points = path.d
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            point.x *= scaleW
            point.y *= scaleH
            if (point.t === 'C') {
                point.x1 *= scaleW
                point.y1 *= scaleH
                point.x2 *= scaleW
                point.y2 *= scaleH
            }
        }
    })   
    return result 
}

export function scalePathsByBox (paths, from, to) {
    const difH = Math.abs(from.h - to.h) 
    const difW = Math.abs(from.w - to.w)

    if (difH <= 1 &&  difW <= 1) {
        return
    }
    paths.forEach(element => {
        if (element.type === 'Path') {
            element.d.forEach(point => {
                const relX = (point.x - from.x) / from.w
                point.x = Math.round(to.x + to.w * relX)

                const relY = (point.y - from.y) / from.h
                point.y = Math.round(to.y + to.h * relY)

                if (point.t === 'C') {
                    const relX1 = (point.x1 - from.x) / from.w
                    point.x1 = Math.round(to.x + to.w * relX1)

                    const relY1 = (point.y1 - from.y) / from.h
                    point.y1 = Math.round(to.y + to.h * relY1)

                    const relX2 = (point.x2 - from.x) / from.w
                    point.x2 = Math.round(to.x + to.w * relX2)

                    const relY2 = (point.y2 - from.y) / from.h
                    point.y2 = Math.round(to.y + to.h * relY2)
                }
            })
        }
    })
}

export function translatePathsByBox (paths, from, to) {
    const difX = Math.round(to.x - from.x)
    const difY = Math.round(to.y - from.y)

    if (difX === 0 && difY === 0) {
        return paths
    }

    paths.forEach(element => {
        if (element.type === 'Path') {
            element.d.forEach(point => {
                point.x += difX
                point.y += difY
                if (point.t === 'C') {
                    point.x1 += difX
                    point.y1 += difY
                    point.x2 += difX
                    point.y2 += difY
                }
            })
        }
    });
}

export function addBoundingBox (paths, bbox) {
    const result = clone(paths)

    result.forEach(path => {
        const points = path.d
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            point.x += bbox.x
            point.y += bbox.y
            if (point.t === 'C') {
                point.x1 += bbox.x
                point.y1 += bbox.y
                point.x2 += bbox.x
                point.y2 += bbox.y
            }

        }
    })   
    return result 
}

export function removeBoundingBox (paths, bbox) {
    const result = clone(paths)

    result.forEach(path => {
        const points = path.d
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            point.x -= bbox.x
            point.y -= bbox.y
            if (point.t === 'C') {
                point.x1 -= bbox.x
                point.y1 -= bbox.y
                point.x2 -= bbox.x
                point.y2 -= bbox.y
            }
        }
    })   
    return result 
}

export function getSVGBoundingBoxByPaths(paths) {
    const result = { x: 100000000, y: 100000000, w: 0, h: 0, isBoundingBox: true};
    for (let path of paths) {
        const points = path.d
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            result.x = Math.min(result.x, point.x);
            result.y = Math.min(result.y, point.y);
            result.w = Math.max(result.w, point.x);
            result.h = Math.max(result.h, point.y);
        }
    }
    result.h -= result.y;
    result.w -= result.x;
    return result
}

export function getSVGBoundingBox(path) {
    const result = { x: 100000000, y: 100000000, w: 0, h: 0, isBoundingBox: true};
    const points = path.d
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        result.x = Math.min(result.x, point.x);
        result.y = Math.min(result.y, point.y);
        result.w = Math.max(result.w, point.x);
        result.h = Math.max(result.h, point.y);
    }
    result.h -= result.y;
    result.w -= result.x;
    return result
}


export function filterDouble(d) {
    return d.filter((p, i) => {
        let next = d[i+1]
        if (next) {
            if (!(next.x !== p.x && next.y !== p.y)) {
                console.warn('remove',i)
            }
            return next.x !== p.x && next.y !== p.y
        }
        return true
    })
}


export function getResizeHandles (bbox, size, r=2) {
  const result = []
  const offset = 0// Math.floor(size / 2)
  const wHalf = Math.round(bbox.w / 2)
  const hHalf = Math.round(bbox.h / 2)
  result.push({
      x: bbox.x - offset,
      y: bbox.y - offset,
      w: size,
      h: size,
      r: r,
      type: 'LeftUp',
      vertical: true,
      horizontal: true
  })
  result.push({
      x: bbox.x - offset,
      y: bbox.y + bbox.h - offset,
      w: size,
      h: size,
      r: r,
      type: 'LeftDown'
  })
  result.push({
      x: bbox.x + bbox.w - offset,
      y: bbox.y - offset,
      w: size,
      h: size,
      r: r,
      type: 'RightUp'
  })
  result.push({
      x: bbox.x + bbox.w - offset,
      y: bbox.y + bbox.h - offset,
      w: size,
      h: size,
      r: r,
      type: 'RighDown'
  })

  result.push({
      x: bbox.x + bbox.w - offset,
      y: bbox.y + hHalf - offset,
      w: size,
      h: size,
      r: r,
      type: 'East'
  })

  result.push({
      x: bbox.x - offset,
      y: bbox.y + hHalf - offset,
      w: size,
      h: size,
      r: r,
      type: 'West'
  })

  result.push({
      x: bbox.x + wHalf - offset,
      y: bbox.y - offset,
      w: size,
      h: size,
      r: r,
      type: 'North'
  })

  result.push({
      x: bbox.x + wHalf - offset,
      y: bbox.y + bbox.h - offset,
      w: size,
      h: size,
      r: r,
      type: 'South'
  })

  return result
}


export function getBezierPoints (path, jointIds, radius) {
    const points = []
    const lines = []
  
    jointIds.forEach(pos => {
        const current = path.d[pos]
        const tempPoints = addBezierPoints(path, pos, radius)
        tempPoints.forEach(point => {
            point.id += '_' + points.length
            points.push(point)
            lines.push({
                id: point.id + '_line' + path.id,
                d: `M ${current.x} ${current.y} L ${point.x} ${point.y}`
            })
        })
    })

    return {
        points: points,
        lines: lines
    }

}

export function addBezierPoints (path, pos, offset) {

    const points = []

    const witdhHeight = offset * 2
    const current = path.d[pos]
    if (current && current.t === 'C') {
        points.push({
            id: 'x2',
            parent: pos,
            isX2: true,
            o: offset,
            x: current.x2,
            y: current.y2,
            h: witdhHeight,
            w: witdhHeight
        })
    }
    const next = path.d[pos + 1]
    if (next && next.t === 'C') {
        points.push({
            id: 'x1',
            parent: pos + 1,
            isX1: true,
            o: offset,
            x: next.x1,
            y: next.y1,
            h: witdhHeight,
            w: witdhHeight
        })
    }

    return points
}

export function getBezierDistance (path, bezierPoint) {
    let jointPosition = bezierPoint.parent
    if (bezierPoint.isX1) {
        jointPosition--
    }

    const result = {}
    const joint = path.d[jointPosition]
    const nexJoint = path.d[jointPosition + 1]

    if (nexJoint) {
        const difX1 = nexJoint.x1 - joint.x
        const difY1 = nexJoint.y1 - joint.y
        result.x1 = Math.sqrt(difX1 * difX1 + difY1 * difY1)
    }
  
    const difX2 = joint.x2 - joint.x
    const difY2 = joint.y2 - joint.y
    result.x2 = Math.sqrt(difX2 * difX2 + difY2 * difY2)

    return result
}

export function getBezierSlopes(path, bezierPoint) {
    let jointPosition = bezierPoint.parent
    if (bezierPoint.isX1) {
        jointPosition--
    }

    const result = {
        x1: Infinity,
        x2: Infinity
    }
    const joint = path.d[jointPosition]
    const nexJoint = path.d[jointPosition + 1]

    if (nexJoint) {
        const difX1 = nexJoint.x1 - joint.x
        const difY1 = nexJoint.y1 - joint.y
        result.x1 = difX1 / difY1
    }
  
    const difX2 = joint.x2 - joint.x
    const difY2 = joint.y2 - joint.y
    result.x2 = difX2 / difY2

    return result
}