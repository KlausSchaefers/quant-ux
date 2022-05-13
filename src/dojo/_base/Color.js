import lang from 'dojo/_base/lang'

export default class Color {

    constructor (color) {
        this.r = 0
        this.g = 0
        this.b = 0
        this.a = 1
        if (color) {
            this.setColor(color)
        }
    }

    setColor (color) {      
        
        if(lang.isString(color)){
            this.fromString(color)
        } else if(lang.isArray(color)){
            this.fromArray(color)
        }else{
            this._set(color.r, color.g, color.b, color.a)
         }
        return this
    }

    _set(r, g, b, a) {
        this.r = r
        this.b = b
        this.g = g
        this.a = a
    }

    toRgb (){      
        const t = this
        return [t.r, t.g, t.b]
    }

    toRgba (){     
        const t = this
        return [t.r, t.g, t.b, t.a]
    }

    toHex (){      
        const rbg = ["r", "g", "b"]
        const arr = rbg.map((x) => {
            let s = this[x].toString(16)
            return s.length < 2 ? "0" + s : s
        });
        return "#" + arr.join("")
    }

    toCss (includeAlpha){    
        const rgb = this.r + ", " + this.g + ", " + this.b;
        return (includeAlpha ? "rgba(" + rgb + ", " + this.a : "rgb(" + rgb) + ")";	// String
    }

    toString (){
        return this.toCss(true)
    }


    static blendColors (
		start,
		end,
		weight,
		obj
	){
        const t = obj || new Color();
        const rgba = ["r", "g", "b", "a"]
		rgba.forEach((x) => {
			t[x] = start[x] + (end[x] - start[x]) * weight
			if(x != "a"){ t[x] = Math.round(t[x]) }
        });
		return t
	}

	fromRgb (color){	
        const m = color.toLowerCase().match(/^rgba?\(([\s\.,0-9]+)\)/)
		return m && this.fromArray(m[1].split(/\s*,\s*/))
	}

	fromHex (color){	
        let t = this;
		let bits = (color.length == 4) ? 4 : 8
		let mask = (1 << bits) - 1
        color = Number("0x" + color.substr(1))
		if(isNaN(color)){
			return
        }
        let rgb = ["b", "g", "r"]
		rgb.forEach(x => {
            var c = color & mask
            color >>= bits
            t[x] = bits == 4 ? 17 * c : c
		})
		t.a = 1
		return t
    }

    fromArray (a) {
        const t = this
		t._set(Number(a[0]), Number(a[1]), Number(a[2]), Number(a[3]));
		if(isNaN(t.a)){
            t.a =
            1;
        }
    }

    fromString (str) {
        if (str === 'transparent') {
            this._set(0, 0, 0, 0);
        } else {
            return this.fromRgb(str) || this.fromHex(str);
        }
    }
}



