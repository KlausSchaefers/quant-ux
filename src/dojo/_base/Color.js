import lang from 'dojo/_base/lang'

export default class Color {

    constructor (color) {
        this.r = 0
        this.g = 0
        this.b = 0
        this.a = 0
        if (color) {
            this.setColor(color)
        }
    }

    setColor (/*Array|String|Object*/ color){
        // summary:
        //		Takes a named string, hex string, array of rgb or rgba values,
        //		an object with r, g, b, and a properties, or another `Color` object
        //		and sets this color instance to that value.
        //
        // example:
        //	|	require(["dojo/_base/color"], function(Color){
        //	|		var c = new Color(); // no color
        //	|		c.setColor("#ededed"); // greyish
        //	|	});
        if(lang.isString(color)){
            this.fromString(color);
        } else if(lang.isArray(color)){
            this.fromArray(color);
        }else{
            this._set(color.r, color.g, color.b, color.a);
         }
        return this;	// Color
    }

    _set(r, g, b, a) {
        this.r = r
        this.b = b
        this.g = g
        this.a = a
    }

    toRgb (){
        // summary:
        //		Returns 3 component array of rgb values
        // example:
        //	|	require(["dojo/_base/color"], function(Color){
        //	|		var c = new Color("#000000");
        //	|		console.log(c.toRgb()); // [0,0,0]
        //	|	});
        var t = this;
        return [t.r, t.g, t.b]; // Array
    }

    toRgba (){
        // summary:
        //		Returns a 4 component array of rgba values from the color
        //		represented by this object.
        var t = this;
        return [t.r, t.g, t.b, t.a];	// Array
    }

    toHex (){
        // summary:
        //		Returns a CSS color string in hexadecimal representation
        // example:
        //	|	require(["dojo/_base/color"], function(Color){
        //	|		console.log(new Color([0,0,0]).toHex()); // #000000
        //	|	});
        let rbg = ["r", "g", "b"]
        var arr = rbg.map((x) => {
            var s = this[x].toString(16);
            return s.length < 2 ? "0" + s : s;
        });
        return "#" + arr.join("");	// String
    }

    toCss (/*Boolean?*/ includeAlpha){
        // summary:
        //		Returns a css color string in rgb(a) representation
        // example:
        //	|	require(["dojo/_base/color"], function(Color){
        //	|		var c = new Color("#FFF").toCss();
        //	|		console.log(c); // rgb('255','255','255')
        //	|	});
        let rgb = this.r + ", " + this.g + ", " + this.b;
        return (includeAlpha ? "rgba(" + rgb + ", " + this.a : "rgb(" + rgb) + ")";	// String
    }

    toString (){
        // summary:
        //		Returns a visual representation of the color
        return this.toCss(true); // String
    }


    static blendColors (
		/*Color*/ start,
		/*Color*/ end,
		/*Number*/ weight,
		/*Color?*/ obj
	){
		// summary:
		//		Blend colors end and start with weight from 0 to 1, 0.5 being a 50/50 blend,
		//		can reuse a previously allocated Color object for the result
        var t = obj || new Color();
        let rgba = ["r", "g", "b", "a"]
		rgba.forEach((x) => {
			t[x] = start[x] + (end[x] - start[x]) * weight;
			if(x != "a"){ t[x] = Math.round(t[x]); }
        });
		return t;	// Color
	}

	fromRgb (/*String*/ color){
		// summary:
		//		Returns a `Color` instance from a string of the form
		//		"rgb(...)" or "rgba(...)". Optionally accepts a `Color`
		//		object to update with the parsed value and return instead of
		//		creating a new object.
		// returns:
        //		A Color object. If obj is passed, it will be the return value.
        // eslint-disable-no-useless-escape
        var m = color.toLowerCase().match(/^rgba?\(([\s\.,0-9]+)\)/);
		return m && this.fromArray(m[1].split(/\s*,\s*/));	// Color
	}

	fromHex (/*String*/ color){
		// summary:
		//		Converts a hex string with a '#' prefix to a color object.
		//		Supports 12-bit #rgb shorthand. Optionally accepts a
		//		`Color` object to update with the parsed value.
		//
		// returns:
		//		A Color object. If obj is passed, it will be the return value.
		//
		// example:
		//	|	require(["dojo/_base/color"], function(Color){
		//	|		var thing = new Color().fromHex("#ededed"); // grey, longhand
		//	|		var thing2 = new Color().fromHex("#000"); // black, shorthand
        //	|	});
        let t = this;
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
            t[x] = bits == 4 ? 17 * c : c;
		})
		t.a = 1;
		return t;	// Color
    }

    fromArray (a) {
        var t = this
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



