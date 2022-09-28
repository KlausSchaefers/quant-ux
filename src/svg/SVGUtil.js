export function getUnZoomedPaths(paths, zoom) {
    const result = clone(paths)
    for (let path of result) {
        const points = path.d
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            point.x = Math.round(point.x / zoom)
            point.y = Math.round(point.y / zoom)
            if (point.t === 'C') {
                point.x1 = Math.round(point.x1 / zoom)
                point.y1 = Math.round(point.y1 / zoom)
                point.x2 = Math.round(point.x2 / zoom)
                point.y2 = Math.round(point.y2 / zoom)
            }
        }
    }

    return result
}

export function getZoomedPaths(paths, zoom) {
    const result = clone(paths)
    for (let path of result) {
        const points = path.d
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
        h: Math.round(box.h * zoom)
    }
}

export function getUnZoomedBox(box, zoom) {
    return {
        x: Math.round(box.x / zoom),
        y: Math.round(box.y / zoom),
        w: Math.round(box.w / zoom),
        h: Math.round(box.h / zoom)
    }
}

export function pathToSVG (d, offsetX =0, offsetY = 0) {
  return d.map(point => {
      if (point.t === 'C') {
        return `C ${point.x1 + offsetX} ${point.y1 + offsetY}, ${point.x2 + offsetX} ${point.y2 + offsetY}, ${point.x + offsetX} ${point.y + offsetY}`
      }
      return `${point.t}${point.x + offsetX} ${point.y + offsetY}`
  }).join(' ')
}

export function getBoxes(elements) {
    const result = []
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        result.push(element.getBBox())
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

function clone(obj) {
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
    const result = clone(paths)
    const scaleW = currentBox.w / sourceBox.w
    const scaleH = currentBox.h / sourceBox.h
    console.debug(scaleH, scaleW)

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

export function filterDouble(d) {
    return d.filter((p, i) => {
        let next = d[i+1]
        if (next) {
            return next.x !== p.x && next.y !== p.y
        }
        return true
    })
}


export function getResizeHandles (bbox, size) {
  let result = []
  let offset = Math.floor(size / 2)
  let wHalf = Math.round(bbox.w / 2)
  let hHalf = Math.round(bbox.h / 2)
  result.push({
      x: bbox.x - offset,
      y: bbox.y - offset,
      w: size,
      h: size,
      type: 'LeftUp',
      vertical: true,
      horizontal: true
  })
  result.push({
      x: bbox.x - offset,
      y: bbox.y + bbox.h - offset,
      w: size,
      h: size,
      type: 'LeftDown'
  })
  result.push({
      x: bbox.x + bbox.w - offset,
      y: bbox.y - offset,
      w: size,
      h: size,
      type: 'RightUp'
  })
  result.push({
      x: bbox.x + bbox.w - offset,
      y: bbox.y + bbox.h - offset,
      w: size,
      h: size,
      type: 'RighDown'
  })

  result.push({
      x: bbox.x + bbox.w - offset,
      y: bbox.y + hHalf - offset,
      w: size,
      h: size,
      type: 'East'
  })

  result.push({
      x: bbox.x - offset,
      y: bbox.y + hHalf - offset,
      w: size,
      h: size,
      type: 'West'
  })

  result.push({
      x: bbox.x + wHalf - offset,
      y: bbox.y - offset,
      w: size,
      h: size,
      type: 'North'
  })

  result.push({
      x: bbox.x + wHalf - offset,
      y: bbox.y + bbox.h - offset,
      w: size,
      h: size,
      type: 'South'
  })

  return result
}