export function pathToSVG (path, offset) {
  return path.d.map(point => {
      if (point.t === 'C') {
        return `C ${point.x1 + offset} ${point.y1 + offset}, ${point.x2 + offset} ${point.y2 + offset}, ${point.x + offset} ${point.y + offset}`
      }
      return `${point.t}${point.x + offset} ${point.y + offset}`
  }).join(' ')
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