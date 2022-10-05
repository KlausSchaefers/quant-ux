
export function getGradientID (i, path, prefix='') {
    return prefix + path.id
}

export function getGradientURL (i, path, prefix='') {
    return 'url(#' + prefix + path.id + ')'   
}


export function getGradientAngle (fill, sizeOfSquare = 1) {
    // add some caching here if needed
    const angleInDegrees = fill.direction
    const constrainedAngle = _constrainAngle(angleInDegrees)
    const [x1, y1,x2, y2]  = _normalizeGradientBase(constrainedAngle)
    const result = _scaleGradientBase(x1, x2, y1, y2, sizeOfSquare)
    return result
}

function _constrainAngle(angleInDegrees) {
    let constrainedAngle = angleInDegrees % 360
    if (constrainedAngle < 0){
        constrainedAngle += 360
    }
    return constrainedAngle
}

function _scaleGradientBase (x1, x2, y1, y2, sizeOfSquare) {
    x1 = (x1 + 1) / 2 * sizeOfSquare
    y1 = (-y1 + 1) / 2 * sizeOfSquare
    x2 = (x2 + 1) / 2 * sizeOfSquare
    y2 = (-y2 + 1) / 2 * sizeOfSquare
    return { x1, y1, x2, y2 }
}

function _normalizeGradientBase (constrainedAngle) {
    const angleBetween0and45deg = constrainedAngle % 45
    const angle45InRadians = Math.PI / 180 * angleBetween0and45deg
    const delta = 1 / Math.cos(angle45InRadians) * Math.sin(angle45InRadians)
   
    let xBase = delta
    let yBase = 1
    let x1 = xBase
    let y1 = yBase
    const angleUnder180 = constrainedAngle % 180
    if (angleUnder180 < 45) {
      x1 = xBase // x ranges from 0 to 1
      y1 = yBase // y is always 1
    } else if (angleUnder180 < 90) {
      x1 = yBase // x is always 1
      y1 = 1 - xBase // y ranges from 1 to 0
    } else if (angleUnder180 < 135) {
      x1 = yBase // x is always 1
      y1 = -xBase // y ranges from 0 to -1
    } else if (angleUnder180 < 180) {
      x1 = 1 - xBase // x ranges from 1 to 0
      y1 = -yBase // y is always -1
    }
    if (constrainedAngle < 180) {
        x1 = -x1
        y1 = -y1
    }
    let x2 = -x1
    let y2 = -y1
  
    return [x1, y1,x2, y2]
}