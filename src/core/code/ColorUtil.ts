export function fromRgb(color: string) {
	const m = color.toLowerCase().match(/^rgba?\(([\s\\.,0-9]+)\)/);
	return m && fromArray(m[1].split(/\s*,\s*/));
}

export function fromHex(color: string) {
	const result: Record<string, number> = {};
	const bits = color.length == 4 ? 4 : 8;
	const mask = (1 << bits) - 1;
	let colorBits = Number("0x" + color.substr(1));
	if (isNaN(colorBits)) {
		return;
	}
	const rgb = ["b", "g", "r"];
	rgb.forEach((x) => {
		const c = colorBits & mask;
		colorBits >>= bits;
		result[x] = bits == 4 ? 17 * c : c;
	});
	result.a = 1;
	return result;
}

export function fromArray(a: string[]) {
	const result: Record<string, number> = {};
	const rgb = ["b", "g", "r"];
	rgb.forEach((x, i) => {
		result[x] = Number.parseFloat(a[i]);
	});
	if (isNaN(result.a)) {
		result.a = 1;
	}
	return result;
}

export function fromString(str: string) {
	if (str === "transparent") {
		return { r: 0, g: 0, b: 0, a: 0 };
	} else {
		return fromRgb(str) || fromHex(str);
	}
}

export function toString(color: any) {
	return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

export function getGradientCSS(gradient: any) {
	let value = "(" + gradient.direction + "deg";
	const sortedColors = gradient.colors.slice();
	sortedColors.sort((a: any, b: any) => {
		return a.p - b.p;
	});
	for (let i = 0; i < sortedColors.length; i++) {
		const color = sortedColors[i];
		value += "," + color.c + " " + color.p + "% ";
	}
	value + ");";
	return value;
}
