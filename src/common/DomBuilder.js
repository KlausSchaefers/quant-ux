import css from 'dojo/css'

export default class DomBuilder {
	constructor() {
		this.current = null
		this.root = null
	}

	tooltip(txt, customClass) {
		if (this.current) {
			var tooltip = document.createElement("div");
			css.add(tooltip, "vommondToolTip");
			if (customClass) {
				css.add(tooltip, customClass);
			}

			var arrow = document.createElement("div");
			tooltip.appendChild(arrow);
			css.add(arrow, "vommondToolTipArrow");

			var lbl = document.createElement("span");
			tooltip.appendChild(lbl);
			css.add(lbl, "vommondToolTipLabel");
			lbl.innerHTML = txt;

			css.add(this.current, "vommondToolTipCntr");
			this.current.appendChild(tooltip);
		} else {
			console.warn("tooltip() > Tooltips can only be attached to build nodes")
		}
		return this;
	}

	row(style, colWidths, colInners, colStyles) {
		const cols = [];
		if (style) {
			style = "row " + style;
		} else {
			style = "row";
		}
		this.div(style);
		for (let i = 0; i < colWidths.length; i++) {
			let colStyle = "col-md-" + colWidths[i];
			if (colStyles) {
				colStyle += " " + colStyles[i];
			}
			if (colInners) {
				this.div(colStyle, colInners[i]);
			} else {
				this.div(colStyle);
			}
			cols.push(this.current);
			this.parent();
		}

		return cols
	}

	div(style, inner, doNotStrip) {
		return this.element("div", style, inner, doNotStrip);
	}

	pre(style, inner) {
		return this.element("pre", style, inner);
	}

	img(href, style) {
		this.element("img", style);
		this.current.src = href;
		return this;
	}

	canvas(width, height) {
		this.element("canvas");
		this.current.height = height;
		this.current.width = width;
		return this;
	}

	ol(style) {
		this.element("ol", style);
		return this;
	}

	ul(style) {
		this.element("ul", style);
		return this;
	}

	li(style, label) {
		this.element("li", style, label);
		return this;
	}

	b(style, lbl) {
		this.element("b", style, lbl);
		return this;
	}

	form(style) {
		return this.element("img", style);
	}

	formGroup(css, label, value, placeholder, type) {
		this.div("form-group");
		this.label("", label);
		this.parent();
		if (!css) {
			this.input("form-control ", value, placeholder, type);
		} else {
			this.input("form-control " + css, value, placeholder, type);
		}
		return this;
	}

	formGroupTextArea(css, label, value, placeholder, type) {
		this.div("form-group");
		this.label("", label);
		this.parent();
		if (!css) {
			this.textarea("form-control ", value, placeholder, type);
		} else {
			this.textarea("form-control " + css, value, placeholder, type);
		}
		return this;
	}

	span(css, inner) {
		return this.element("span", css, inner);
	}

	label(css, inner) {
		return this.element("label", css, inner);
	}

	file(css) {
		this.element("input", css);
		this.current.type = "file";
		return this;
	}

	input(css, value, placeholder, type) {
		this.element("input", css);
		if (value) {
			this.current.value = value;
		}
		if (placeholder) {
			this.current.placeholder = placeholder;
		}
		if (type) {
			this.current.type = type;
		} else {
			this.current.type = "text";
		}


		return this;
	}

	textarea(css, value, placeholder) {
		this.element("textarea", css);
		if (value) {
			this.current.value = value;
		}
		if (placeholder) {
			this.current.placeholder = placeholder;
		}

		return this;
	}

	table(css) {
		return this.element("table", css);
	}

	thead(headers) {
		const thead = this.element("thead")
		if (headers) {
			const tr = document.createElement("tr")
			this.current.appendChild(tr);
			for (let i = 0; i < headers.length; i++) {
				const td = document.createElement("td")
				td.innerHTML = headers[i];
				tr.appendChild(td);
			}
		}
		return thead;
	}

	tbody(css) {
		return this.element("tbody", css);
	}

	tr(row) {
		const tr = this.element("tr")
		if (row) {
			for (let i = 0; i < row.length; i++) {
				const td = document.createElement("td")
				td.innerHTML = row[i];
				this.current.appendChild(td);
			}
		}
		return tr;
	}

	td(css, inner) {
		return this.element("td", css, inner);
	}

	a(css, inner) {
		return this.element("a", css, inner);
	}

	p(css, inner, doNotStrip) {
		return this.element("p", css, inner, doNotStrip);
	}

	h1(css, inner) {
		this.element("h1", css, inner);
		return this;
	}

	h2(css, inner) {
		this.element("h2", css, inner);
		return this;
	}

	h3(css, inner) {
		this.element("h3", css, inner);
		return this;
	}

	element(type, style, inner, doNotStrip) {
		const element = document.createElement(type);
		if (this.current != null) {
			this.current.appendChild(element);
		}
		if (style != null) {
			css.add(element, style);
		}
		if (inner != null) {
			if (doNotStrip) {
				element.innerHTML = inner;
			} else {
				element.innerHTML = this.stripHTML(inner);
			}
		}
		this.current = element;
		if (this.root == null) {
			this.root = element;
		}
		return this;
	}

	child(type, style, inner) {
		const element = document.createElement(type);
		if (this.current != null) {
			this.current.appendChild(element);
		} else {
			console.warn("No Parent node created. you cannot add a child");
		}
		if (style != null) {
			css.add(element, style);
		}
		if (inner != null) {
			element.innerHTML = this.stripHTML(inner);
		}
		return this;
	}

	inner(inner) {
		if (this.current) {
			this.current.innerHTML = this.stripHTML(inner);
		}
		return this;
	}

	css(c) {
		if (this.current) {
			css.add(this.current, c);
		}
		return this;
	}

	get() {
		return this.current;
	}

	up() {
		if (this.current) {
			this.current = this.current.parentNode;
		}
		return this;
	}

	parent() {
		if (this.current) {
			this.current = this.current.parentNode;
		}
		return this;
	}

	reset() {
		this.current = null;
		this.root = null;
	}

	build(node, clear) {
		if (node) {
			if (node.substring) {
				node = document.getElementById(node);
				if (clear) {
					node.innerHTML = "";
				}
			}
			node.appendChild(this.root);
		}
		var result = this.current;
		this.reset();
		return result;
	}

	top(h, unit = "px") {
		return this.setStyle("top", h + unit);
	}

	bottom(b, unit = "px") {
		return this.setStyle("bottom", b + unit);
	}

	left(h, unit = "px") {
		return this.setStyle("left", h + unit);
	}

	h(h, unit = "px") {
		return this.setStyle("height", h + unit);
	}

	w(h, unit = "px") {
		return this.setStyle("width", h + unit);
	}

	marginBottom(m) {
		return this.setStyle("marginBottom", m + "px");
	}

	marginRight(m) {
		return this.setStyle("marginRight", m + "px");
	}

	paddingRight(m) {
		return this.setStyle("paddingRight", m + "px");
	}

	paddingLeft(m) {
		return this.setStyle("paddingLeft", m + "px");
	}

	paddingTop(m) {
		return this.setStyle("paddingTop", m + "px");
	}

	background(m) {
		return this.setStyle("background", m);
	}

	borderWidth(m) {
		return this.setStyle("borderWidth", m + "px");
	}

	borderColor(m) {
		return this.setStyle("borderColor", m);
	}

	borderRadius(m, unit = 'px') {
		return this.setStyle("borderRadius", m + unit);
	}

	paddingBottom(m) {
		return this.setStyle("paddingBottom", m + "px");
	}

	fontSize(m) {
		return this.setStyle("fontSize", m + "px");
	}

	setStyle(key, value) {
		if (this.current) {
			this.current.style[key] = value;
		}
		return this;
	}

	stripHTML(s) {
		if (s == null || s == undefined)
			s = "";
		if (s.replace) {
			s = s.replace(/</g, "&lt;");
			s = s.replace(/>/g, "&gt;");
			s = s.replace(/<\/?[^>]+(>|$)/g, "");
			s = s.replace(/\n/g, "<br>");
			s = s.replace(/\$perc;/g, "%");
		}

		return s;
	}
}