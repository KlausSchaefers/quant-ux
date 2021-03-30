export function fromRgb (/*String*/ color){
  var m = color.toLowerCase().match(/^rgba?\(([\s\\.,0-9]+)\)/);
  return m && fromArray(m[1].split(/\s*,\s*/));	// Color
}

export function fromHex (/*String*/ color ) {
  let result = {};
  let bits = (color.length == 4) ? 4 : 8;
  let mask = (1 << bits) - 1;
  color = Number("0x" + color.substr(1));
  if(isNaN(color)){
    return
  }
  let rgb = ["b", "g", "r"]
  rgb.forEach(x => {
      var c = color & mask;
      color >>= bits;
      result[x] = bits == 4 ? 17 * c : c;
  })
  result.a = 1;
  return result
}

export function fromArray (/** array */ a) {
  var result = {}
  let rgb = ["b", "g", "r"]
  rgb.forEach((x, i) => {
    result[x] = a[i] * 1
  })
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
