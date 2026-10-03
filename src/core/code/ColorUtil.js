/**
 * {r, g, b, a} of an rgb() / rgba() color, in the comma form of the computed
 * style ("rgba(0, 0, 0, 0.5)") or the space form of authored CSS
 * ("rgb(0 0 0 / 50%)"). Undefined for anything else.
 */
export function fromRgb (/*String*/ color){
  const m = String(color).trim().match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)(%?)\s*)?\)$/i)
  if (!m) {
    return undefined
  }
  let a = m[4] === undefined ? 1 : parseFloat(m[4])
  if (m[5]) {
    a = a / 100
  }
  return { r: parseFloat(m[1]), g: parseFloat(m[2]), b: parseFloat(m[3]), a: a }
}

/**
 * {r, g, b, a} of a #rgb, #rgba, #rrggbb or #rrggbbaa color. Undefined for
 * anything else, a named color included.
 */
export function fromHex (/*String*/ color ) {
  const m = String(color).trim().match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (!m) {
    return undefined
  }
  let digits = m[1]
  if (digits.length <= 4) {
    digits = digits.split('').map(d => d + d).join('')
  }
  const channel = i => parseInt(digits.substr(i * 2, 2), 16)
  return {
    r: channel(0),
    g: channel(1),
    b: channel(2),
    a: digits.length === 8 ? Math.round(channel(3) / 255 * 1000) / 1000 : 1
  }
}

export function fromArray (/** array */ a) {
  var result = {}
  let rgb = ["r", "g", "b"]
  rgb.forEach((x, i) => {
    result[x] = a[i] * 1
  })
  result.a = a[3] * 1
  if(isNaN(result.a)){
      result.a = 1;
  }
  return result
}


export function fromString (str) {
    if (str === 'transparent') {
        return {r: 0, g:0, b:0, a:0}
    } else {
        return fromRgb(str) || fromHex(str);
    }
}

export function toString(color) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}


export function getGradientCSS(gradient) {
  let value = "(" + gradient.direction + "deg";
  const sortedColors = gradient.colors.slice()
  sortedColors.sort((a, b) => {
    return a.p - b.p
  })
  for (let i = 0; i < sortedColors.length; i++) {
    const color = sortedColors[i];
    value += "," + color.c + " " + color.p + "% ";
  }
  value + ");";
  return value;
}
