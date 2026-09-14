<template>
	<div class="MatcDesignTokenMixin MatcToolbarPopUpCntr">
		<DesignTokenView v-if="hasDesignToken" :designtoken="currentDesignToken" @change="onDTChange"/>
		<div v-show="!hasDesignToken">
			<div type="button" ref="button"
				:class="['MatcToolbarColorButton MatcToolbarItem MatcToolbarIconButton MatcToolbarColor', 
				{ '': hex }, 
				{ 'MatcToolbarLabeledColor': label }, 
				{ 'MatcToolbarColorHexError': hexError }
	
				]">
				<span data-dojo-attach-point="icon" class="MatcToolbarColorIndicator"></span>
				<span v-if="label" class="MatcToolbarItemLabel">{{ label }}</span>
				<input v-if="hex" class="MatcIgnoreOnKeyPress  MatcToobarInputInlineEdit" @mousedown.stop=""
					@click.stop="focusHex" :value="colorAsHex" @change="setColorHasHex" ref="hexInput" />
			</div>
		</div>
		<div class="MatcToolbarPopUpBackDrop" v-if="isDialog && isOpen" @click="hideDropDown"></div>
		<div :class="['MatcToolbarPopUp MatcToolbarDropDownButtonPopup',{ 'MatcToolbarGradientHidden': !showGradient && hasGradient } ]" role="menu" data-dojo-attach-point="popup">
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Color from 'dojo/_base/Color'
import touch from 'dojo/touch'
import ColorPickerSketch from 'common/ColorPickerSketch'
import GradientPicker from 'common/GradientPicker'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import _DropDown from './_DropDown'
import _Color from 'common/_Color'
import Util from 'core/Util'
import * as ColorUtil from 'core/code/ColorUtil'
import _DesignToken from './_DesignToken'
import DesignTokenView from './DesignTokenView'

export default {
	name: 'ToolbarColor',
	mixins: [Util, _Color, DojoWidget, _DesignToken, _DropDown],
	props: ['isDialog', 'color', 'app', 'lbl', 'qIsDropDown'],
	data: function () {
		return {
			value: null,
			tempValue: false,
			updateColor: false,
			updateBackground: false,
			updateLabel: false,
			updateLabelBackground: false,
			hasCustomColor: true,
			reposition: true,
			columns: 10,
			hasGradient: false,
			showGradient: true,
			arrowPosition: "right",
			keepOpenOnTypeSelection: null,
			lastOpen: 0,
			lastClose: 0,
			hex: false,
			hexError: false,
			dropdown: false,
			label: null,
			hasPicker: true,
			hasDesignTokens: false
		}
	},
	components: {
		'DesignTokenView': DesignTokenView
	},
	computed: {
		colorAsHex() {
			if (this.tempValue) {
				return this.toHex(this.tempValue)
			}
			if (this.value) {
				return this.toHex(this.value)
			}

			return ''
		}
	},
	methods: {

		onDTChange (dt) {
			console.debug('onDTChange', dt)
			//this.showDropDown()
		},

		getColorDesignTokens() {
			const result = []
			if (this.model && this.model.designtokens) {
				for (let id in this.model.designtokens) {
					const token = this.model.designtokens[id]
					if (token.type === 'color') {
						result.push(token)
					}
				}
			}
			return result
		},

		renderDesignTokenBoxes(tokens, parent, columns, callback) {
			const boxes = {};
			const table = document.createElement("table");
			const tbody = document.createElement("tbody");
			table.appendChild(tbody);

			let tr = null;
			for (let i = 0; i < tokens.length; i++) {
				if (i % columns == 0 || tr == null) {
					tr = document.createElement("tr");
					tbody.appendChild(tr);
				}
				const token = tokens[i];
				const td = document.createElement("td");
				td.title = token.name;
				css.add(td, "MatcColorBox MatcColorBox" + (i % columns));
				const span = document.createElement("span");
				if (this.isGradient(token.value)) {
					this._setGradientCSS(span, token.value)
				} else {
					span.style.backgroundColor = token.value;
				}
				boxes[token.id] = span;
				this.tempOwn(on(span, touch.press, lang.hitch(this, callback, token)));
				td.appendChild(span);
				tr.appendChild(td);
			}
			parent.appendChild(table);
			return boxes;
		},

		onDesignTokenSelected(token, e) {
			this.stopEvent(e);
			this.onDesignTokenChange(token)
		},

		onDesignTokenChange(token) {
			console.debug('ToolbarColor.onDesignTokenChange', token)
		},

		reOpenDropDown() {
			if (this.hasDesignToken) {
				this.logger.log(-1, 'reOpenDropDown', 'Exit because of design token')
				return
			}
			let now = new Date().getTime()
			if (!this.ignoreReOpen || (now - this.ignoreReOpen) > 500) {
				this.showDropDown()
			} else {
				this.logger.log(-1, 'reOpenDropDown', 'Ignore')
			}
			this.ignoreReOpen = 0
		},

		focusHex() {
			this.hideDropDown()
			if (this.$refs.hexInput) {
				this.$refs.hexInput.focus()
				this.$refs.hexInput.select()
			}
		},

		toHex(v) {
			if (v === "transparent") {
				return "-"
			}
			if (v.colors) {
				let start = new Color(v.colors[0].c).toHex()
				let end = new Color(v.colors[1].c).toHex()
				return start + " -> " + end
			}
			let c = new Color(v)
			return c.toHex()
		},

		setColorHasHex() {
			this.hexError = false
			if (this.$refs.hexInput) {
				let value = this.$refs.hexInput.value
				if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
					this.ignoreReOpen = new Date().getTime()
					this.emit("change", value);
				} else {
					console.debug('ToolbarColor.setColorHasHex() > Wrong value', value)
					this.hexError = true
				}
			}
		},

		init() {
			this._renderColorWidgets(this.popup)
			this.renderRemovePopupFooter("No Color", lang.hitch(this, "setTransparent"), 'ColorTrans');
		},

		_renderColorWidgets(popup) {

			this.tabs = null


			var db = new DomBuilder();
			var cntr = db.div("MatcToolbarPopUpContainer MatcToolbarColorContainer MatcToolbarColorSketch").build();

			/**
			 * render tabs
			 */

			if (this.hasGradient || this.hasPicker) {

				let tabHeader = db.div("MatcToolbarTabContainer").div("MatcToolbarTabs").build(popup);

				/**
				 * Picker Tab
				 */
				if (this.hasPicker) {
					let tabPicker = this.createTab("Solid", tabHeader, cntr, db, true);
					this.pickerDiv = db.div("Pick").build(tabPicker);
					this.picker = this.$new(ColorPickerSketch);
					this.picker.placeAt(this.pickerDiv);
					this.own(on(this.picker, "change", lang.hitch(this, "onTempColorSelected")));

					this.customColorDivLabel = db.div("MatcToolbarColorLabel", "Global Colors").build(this.pickerDiv);
					this.customColorDiv = db.div("MatcToolbarColorCustomCntr").build(this.pickerDiv);
				}

				/**
				 * Solid color tab
				 */
				if (this.hasDesignTokens) {
					let tabSolidColor = this.createTab("Color Tokens", tabHeader, cntr, db, true);
					this.colorDiv = db.div().build(tabSolidColor);
				}
		

				/**
				 * Gradient Tab
				 */
				if (this.hasGradient) {
					let tabGradient = this.createTab("Gradient", tabHeader, cntr, db, false, "MatcToolbarTabTypeGradient");

					this.gradientDiv = db.div().build(tabGradient);

					this.gradientPicker = this.$new(GradientPicker)
					this.gradientPicker.placeAt(this.gradientDiv)
					this.own(on(this.gradientPicker, "change", lang.hitch(this, "onTempColorSelected")));

					/**
					 * Add hre gradient picker
					 */
					this.customGradientLabel = db.div("MatcToolbarColorLabel", "Global Gradients").build(tabGradient);
					this.customGardintDiv = db.div("MatcToolbarColorCustomCntr").build(tabGradient);

				}

			} else {
				let tabHeader = db.div("MatcToolbarTabContainer").div("MatcToolbarTabs").build(popup);
				/**
				 * Solid color tab
				 */
				this.createTab("Color Tokens", tabHeader, cntr, db, true);
				this.colorDiv = db.div().build(cntr);
			}


			popup.appendChild(cntr)
			return cntr
		},

		onVisible() {
			this.reOpenTab();
			this.setColorValues()
		},

		setShowGradient(showGradient) {
			this.showGradient = showGradient
			
		},

		setColorValues() {
			this.cleanUpTempListener();

			/**
			 * 1) set palette
			 */
			if (this.picker) {
				this.picker.setValue(this.value);
			}

			/**
			 * 2) render color design tokens
			 */
			if (this.colorDiv) {
				this.colorDiv.innerHTML = "";
				this.renderDesignTokenBoxes(this.getColorDesignTokens(), this.colorDiv, this.columns, "onDesignTokenSelected");
			}
	

			/**
			 * 3) render custom colors
			 */
			var customColors = this.getCustomColors();
			this._renderCustomColors(customColors, this.customColorDivLabel, this.customColorDiv);

			/**
			 * 4) Render Gradient
			 */
			if (this.hasGradient && this.gradientPicker) {
				this.gradientPicker.setValue(this.value, true)
				this.customGardintDiv.innerHTML = ""
				this._gradientBoxes = []
				this.renderCustomGradientBoxes(this._gradientBoxes, this.customGardintDiv, 6, "onChange")
			}

			this.lastOpen = new Date().getTime();
		},

		_renderCustomColors(customColors, labelDiv, div) {
			if (div) {
				div.innerHTML = "";
				if (customColors.length > 0) {
					var customColorBoxes = this.renderColorBoxes(customColors, this.customColorDiv, this.columns, "onColorSelected");
					this.setBoxes(customColorBoxes);
					css.remove(labelDiv, "hidden");
				} else {
					css.add(labelDiv, "hidden");
				}
			}
		},


		onColorSelected(c, e) {
			this.stopEvent(e);
			if (c != "") {
				this._ignoreHide = false;
				this.onChange(c, e);
			} else {
				this.stopEvent(e);
				this.hideDropDown();
			}
		},

		onTempColorSelected(value) {
			if (this.value != value) {
				this.tempValue = value;
				this.emit("changing", value);
				this.setLabelColor(value);
			}
		},

		flush() {
			if (this.tempValue) {
				this.emit("change", this.tempValue);
				this.tempValue = false
			}
		},

		setTransparent() {
			this.onTempColorSelected('transparent')
		},

		onHide() {
			this.flush();
			if (this.gradientPicker) {
				this.gradientPicker.onParentClose()
			}
			if (this.picker) {
				this.picker.onParentClose()
			}
			this.lastClose = new Date().getTime();
		},

		getCustomColors() {
			const colors = [];
			if (this.model) {
				const temp = {}
				this.getBoxColors(this.model.screens, temp)
				this.getBoxColors(this.model.widgets, temp)
				if (this.model.templates) {
					this.getBoxColors(this.model.templates, temp)
				}

				const list = []
				for (let color in temp) {
					list.push({
						color: color,
						count: temp[color]
					});
				}
				for (let i = 0; i < list.length; i++) {
					colors.push(list[i].color);
				}
			}
			return colors;
		},

		getCustomGradients() {
			let colors = [];
			if (this.model) {
				const temp = {}
				this.getBoxGradient(this.model.screens, temp);
				this.getBoxGradient(this.model.widgets, temp);
				colors = Object.values(temp)
			}
			return colors;
		},

		getBoxGradient(boxes, result) {
			for (var id in boxes) {
				var box = boxes[id];
				let back = box.style.background;
				if (back != undefined && this.isGradient(back)) {
					let css = ColorUtil.getGradientCSS(back)
					this._countGradient(css, back, result);
				}
			}
		},

		_countGradient(css, gradient, result) {
			if (css) {
				if (!result[css]) {
					result[css] = {
						gradient: gradient,
						css: css,
						count: 0
					}
				}
				result[css].count++;
			}
		},

		getBoxColors(boxes, result) {
			for (var id in boxes) {
				var box = boxes[id];
				if (box.style) {
					this._countColor(box.style.background, result);
					this._countColor(box.style.color, result);
					this._countColor(box.style.borderTopColor, result);
					this._countColor(box.style.evenRowBackground, result);
					this._countColor(box.style.evenRowColor, result);
					this._countColor(box.style.headerBackground, result);
					this._countColor(box.style.headerColor, result);
					this._countColor(box.style.colorButton, result);
					// since 3.0.15 we have timelines
					this._countColor(box.style.cicleBackground, result);
					this._countColor(box.style.cicleBorderColor, result);
					this._countColor(box.style.lineBackground, result);
					this._countColor(box.style.lineBorderColor, result);
					this._countColor(box.style.cicleActiveBackground, result);
					this._countColor(box.style.cicleActiveTextColor, result);
					this._countColor(box.style.cicleActiveBorderColor, result);

					this._countColor(box.style.tooltipBackground, result);
					this._countColor(box.style.tooltipColor, result);
				}

				if (box.active) {
					this._countColor(box.active.background, result);
					this._countColor(box.active.color, result);
					this._countColor(box.active.borderTopColor, result);
				}
				if (box.hover) {
					this._countColor(box.hover.background, result);
					this._countColor(box.hover.color, result);
					this._countColor(box.hover.borderTopColor, result);
				}
				if (box.error) {
					this._countColor(box.error.background, result);
					this._countColor(box.error.color, result);
					this._countColor(box.error.borderTopColor, result);
				}
			}
		},

		_countColor(color, result) {
			if (color && color.colors) {
				for (let i = 0; i < color.colors.length; i++) {
					const gradienColor = color.colors[i]?.c
					if (gradienColor && gradienColor !== "transparent" && color !== "none") {
						if (!result[gradienColor]) {
							result[gradienColor] = 0
						}
						result[gradienColor]++;
					}
				}
			}
			if (color && color !== "transparent" && color !== "none") {
				if (!result[color]) {
					result[color] = 0
				}
				result[color]++;
			}
		},

		setCustomColor(colorPicker, d) {
			var color = colorPicker.getValue();
			if (color) {
				this.onChange(color.toHex());
			}
			this.closeColorDialog(d);
		},

		setGradient(gradientPicker, d) {
			var gradient = gradientPicker.getValue();
			if (gradient) {
				this.onChange(gradient);
			}
			this.closeColorDialog(d);
		},

		closeColorDialog(d) {
			d.close();
			this._ignoreHide = false;
		},

		setValue(v) {
			if (this.domNode) {
				this.setLabelColor(v);
			} else {
				console.warn("setValue() > Widget disposed");
			}

			/**
			 * Gradients will open the right tab...
			 */
			if (this.hasGradient && this.isGradient(v)) {
				this.onSelectTab(2, false)
			} else {
				this.onSelectTab(0)
			}

			/**
			 * If we keep the popup open, we should make sure
			 * that we update the colors
			 */
			this.value = v;
			if (this.isOpen && !this.isGradient(v)) {
				this.onVisible();
			}
		},

		setLabelColor(v) {
			if (v === 'None' || v === 'transparent' || !v) {
				v = '';
			}
			if (this.icon && this.icon.style) {
				if (this.isGradient(v)) {
					const gradient = ColorUtil.getGradientCSS(v)

					this.icon.style.background = "linear-gradient" + gradient
					this.icon.style.background = "-webkit-linear-gradient" + gradient;
				} else {
					this.icon.style.background = v;
				}
			}
		},

		setBoxes(boxes) {
			if (!this.isGradient(this.value)) {
				for (var color in boxes) {
					var span = boxes[color];
					if (this.value == color) {
						span.style.borderColor = "red";
					} else {
						span.style.borderColor = 'rgba(0,0,0, 0.15);';
					}
				}
			}
		},

		isGradient(v) {
			return v != null && v != undefined && v.gradient;
		},

		getValue() {
			return this.value;
		},

		setLabel(value) {
			this.label = value;
		},

		setModel(m) {
			this.model = m;
		},

		renderCustomGradientBoxes(boxes, parent, columns, callback) {
			let customGradients = this.getCustomGradients()
			// do not render duplicates
			customGradients = customGradients.filter(g => {
				return g !== null && boxes[g.css] === undefined
			})

			var table = document.createElement("table");
			var tbody = document.createElement("tbody");
			table.appendChild(tbody);
			let tr = null
			for (let i = 0; i < Math.min(customGradients.length, 10); i++) {
				var gradient = customGradients[i].gradient;
				if (i % columns == 0 || tr == null) {
					tr = document.createElement("tr");
					tbody.appendChild(tr);
				}
				var td = document.createElement("td");
				css.add(td, "MatcGradientBox MatcColorBox MatcColorBox" + i % columns);
				var span = document.createElement("span");
				var cssGradientKey = this._setGradientCSS(span, gradient)
				boxes[cssGradientKey] = span;
				this.tempOwn(on(span, touch.press, lang.hitch(this, callback, gradient)));
				td.appendChild(span);
				tr.appendChild(td);
			}
			parent.appendChild(table);
		},


		_setGradientCSS(node, gradient) {
			const value = ColorUtil.getGradientCSS(gradient)
			node.style.background = "linear-gradient" + value;
			node.style.background = "-webkit-linear-gradient" + value;
			return value;
		},

		createTab(lbl, parent, cntr, db, showDefaultColor, customClass) {
			if (!this.tabs) {
				this.tabs = [];
				this.tabContainers = [];
			}
			var tab = db.a("MatcToolbarTabActive " + customClass, lbl).build(parent);
			var tabCntr = db.div().build(cntr);
			this.tabs.push(tab);
			this.tabContainers.push(tabCntr);
			this.own(on(tab, touch.press, lang.hitch(this, "onSelectTab", this.tabContainers.length - 1, showDefaultColor)));

			return tabCntr;
		},

		onSelectTab(i, showDefaultColor, e) {
			this.stopEvent(e);
			if (this.tabs) {
				for (var j = 0; j < this.tabs.length; j++) {
					css.remove(this.tabs[j], "MatcToolbarTabActive");
					css.add(this.tabContainers[j], "hidden");
				}
				css.add(this.tabs[i], "MatcToolbarTabActive");
				css.remove(this.tabContainers[i], "hidden");
			}
			this._selectedTabNumber = i;
			this.__selectedTabDefault = showDefaultColor
		},

		reOpenTab() {
			if (this._selectedTabNumber) {
				this.onSelectTab(this._selectedTabNumber, this.__selectedTabDefault)
			} else {
				this.onSelectTab(0, true)
			}
		}
	},
	watch: {
		color(v) {
			this.setValue(v)
		},
		app(v) {
			this.setModel(v)
		}
	},
	mounted() {
		this.logger = new Logger('ToolbarColorDT')
		if (this.isDialog) {
			this.reposition = true
			this.arrowPosition = true
			this.hasPicker = true
			this.updateLabel = true
			this.chevron = false
			css.add(this.popup, 'MatcToolbarPopUpDialog')
			this.setChevron()
		}

		if (this.app) {
			this.setModel(this.app)
		}

		if (this.color) {
			this.setValue(this.color)
		}

		if (this.lbl) {
			this.setLabel(this.lbl)
		}

		if (this.qIsDropDown) {
			this.isChildDropDown = this.qIsDropDown
		}
	}
}
</script>