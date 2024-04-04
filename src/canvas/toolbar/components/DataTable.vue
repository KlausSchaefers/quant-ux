
<template>
	<div class="MatcToolbarTable MatcDataTable">
		<div data-dojo-attach-point="cntr" class="MatcToolbarTableBody">
		</div>
		<!-- <div class="MatcToolbarTableUpload" data-dojo-attach-point="upload">
			<a href="#">Upload CSV</a>
			<input type="file" data-dojo-attach-point="file" class="MatcImageUploadFile"/>
		</div> -->
	</div>
</template>
<style lang="scss">
@import '../../../style/components/toolbar_table.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import win from 'dojo/_base/win'
import keys from 'dojo/keys'
import DomBuilder from 'common/DomBuilder'
import Util from 'core/Util'

export default {
	name: 'Table',
	props: ["columns", "tableData"],
	mixins: [Util, DojoWidget],
	data: function () {
		return {
			value: null,
			inputEvent: "change",
			rows: 100,
			defaultColWidth: 100,
			maxWidth: 1000,
			columnWidths: [],
			rowHeight: 30,
			countRowWidth: 30,
			columnNames: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
			data: [],
			widthDirty: false,
			dataDirty: false,
			inputClicked: false,
			actionKeys: [37],
			mode: "blur",
			hasHeader: false,
			widgetsWithHeader: ['Repeater', 'Table']
		}
	},
	components: {},
	methods: {
		postCreate() {
			this.own(on(win.body(), "keydown", lang.hitch(this,"onBodyKeyDown")));
			this.selection = {
				r: 0,
				c: 0
			};
		},

		onChange () {
			this.$emit("change", this.getData())
		},

		isDirty() {
			return this._dirty;
		},

		getData() {
			const data = [];
			let maxC = 0;
			for (let r = 0; r < this.inputs.length; r++) {
				const inputRow = this.inputs[r];
				const row = [];
				for (let c = 0; c < inputRow.length; c++) {
					const value = this.inputs[r][c].value;
					if (value) {
						row[c] = value;
						maxC = Math.max(maxC, c);
					}
				}
				if (row.length > 0) {
					data[r] = row;
				}
			}
			maxC++;
			/**
			 * Fill up undefined
			 */
			for (let r = 0; r < data.length; r++) {
				if (data[r] === undefined) {
					data[r] = []
				}
				for (let c = 0; c < maxC; c++) {
					if (data[r][c] == undefined) {
						data[r][c] = "";
					}
				}
			}
			return data;
		},


		renderData(data) {
			data = this.parseData(data);

			for (let r = 0; r < data.length; r++) {
				if (this.inputs[r]) {
					const row = data[r];
					if (row) {
						for (let c = 0; c < row.length; c++) {
							if (row[c] != undefined && row[c] != null) {
								if (this.inputs[r][c]) {
									this.inputs[r][c].value = row[c];
								} else {
									console.warn("ToolbarTable.renderData() > no input for " + c + ', ' + r)
								}
							}
						}
					}

				}
			}
		},

		render() {

			this.tds = [];
			this.inputs = [];
			this.columnTDs = [];

			const db = new DomBuilder()
			const table = db.table("").build()


			/**
			 * header
			 */
			const thead = db.element("thead").build(table)
			const tr = db.element("tr", 'MatcToolbarTableHead').build(thead);
			let td = db.element("td").build(tr);
			td.style.width = this.countRowWidth + "px";
			for (let i = 0; i < this.columns.length; i++) {
				const c = this.columns[i]
				const td = db.element("td").build(tr);
				td.style.width = this.columnWidths[i] + "px";
				const lbl = db.div("MatcToolbarTableLabel").build(td);
				const input = db.input("vommondInlineEdit", c.label).build(lbl)
				input.placeholder = "Enter Name"
				this.tempOwn(on(input, "change", () => {this.onChangeColumnName(i, input)}))
				this.tempOwn(on(input, "keydown", e => {e.stopPropagation()}));
				const handle = db.div("MatcToolbarTableColumnHandle").build(lbl);
				this.tempOwn(on(handle, touch.press, lang.hitch(this, "onBarPress", i, handle)));
				this.columnTDs[c] = td;
			}
			// add here a comlumn for a plus button?? td = db.element("td").build(tr);

			/**
			 * Body
			 */
			const tbody = db.tbody().build(table)
			for (let r = 0; r < this.rows; r++) {
				const tr = db.element("tr").build(tbody);
				td = db.element("td").build(tr);
				td.style.height = this.rowHeight + "px";

				if (r === 0 && this.hasHeader) {
					td.innerHTML = 'Header'
					td.style.width = "50px";
					css.add(tr, 'MatcToolbarTableLabelRow')
				} else {
					td.innerHTML = r;
					td.style.width = "30px";
				}

				this.inputs.push([]);
				for (let c = 0; c < this.columns.length; c++) {
					td = db.element("td").build(tr);
					td.style.height = this.rowHeight + "px";
					const input = db.element("input", "MatcIgnoreOnKeyPress").build(td);
					this.tempOwn(on(input, "focus", lang.hitch(this, "onFocus", r, c, input)));
					this.tempOwn(on(input, "blur", lang.hitch(this, "onBlur", r, c, input)));
					this.tempOwn(on(input, touch.press, lang.hitch(this, "onClick", r, c, input)));
					this.tds.push(td);
					this.inputs[r].push(input);
				}
			}
			this._table = table
			this.cntr.appendChild(table)
		},


		onBodyKeyDown(e) {

			let isCntrl = e.altKey || e.ctrlKey || e.metaKey;
			let k = e.keyCode ? e.keyCode : e.which;
			let row = this.selection.r * 1;
			let column = this.selection.c * 1;


			if (k == 86 && isCntrl) { // ctrl -v
				this.onPaste(this.selection.r, this.selection.c, e);
				this.stopPropagation(e);
				return;
			}

			if (this.mode == "blur") {

				switch (k) {
					case 37:
						this.selectInput(row, column - 1);
						this.stopEvent(e);
						break;
					case 39:
						this.selectInput(row, column + 1);
						this.stopEvent(e);
						break;
					case 40:
						this.selectInput(row + 1, column);
						this.stopEvent(e);
						break;
					case 38:
						this.selectInput(row - 1, column);
						this.stopEvent(e);
						break;

					case keys.DELETE:
						if (this.inputs[row] && this.inputs[row][column]) {
							let input = this.inputs[row][column];
							input.value = "";
						}
						this.stopEvent();
						break;
					case keys.BACKSPACE:
						if (this.inputs[row] && this.inputs[row][column]) {
							let input = this.inputs[row][column];
							input.value = "";
						}
						this.stopEvent();
						break;
					default:
						this.focusInput(row, column);
						break;

				}


			} else {

				let pos = 0;
				let length = 0;
				let input = null;
				if (this.inputs[row] && this.inputs[row][column]) {
					input = this.inputs[row][column];
					length = input.value.length
					pos = this.getCarretPosition(input);
				}

				if (k == 37) { // left
					if (pos == 0) {
						this.selectInput(row, column - 1, e.target);
						this.stopEvent(e);
					}
				}

				if (k == 39) { // right
					if (pos == length) {
						this.selectInput(row, column + 1, e.target);
						this.stopEvent(e);
					}
				}

				if (k == 40) { // down
					this.selectInput(row + 1, column);
				}

				if (k == 38) { // up
					this.selectInput(row - 1, column);
				}
			}

			this.dataDirty = true;

		},

		onChangeColumnName (c, input) {
			const name = input.value
			this.$emit('colNameChange', c, name)
		},

		onFocus(r, c) {
			this.selection = {
				r: r,
				c: c
			};
			this.mode = "focus";
		},

		onBlur() {
			this.mode = "blur";
			this.onChange()
			this.unselectAll();
		},

		/**
		 * https://www.lucidchart.com/techblog/2014/12/02/definitive-guide-copying-pasting-javascript/
		 */
		onPaste(row, column) {
			const parent = this.domNode;
			let input = null;
			if (this.inputs[row] && this.inputs[row][column]) {
				input = this.inputs[row][column];
			}
			const hidden = document.createElement("textarea");
			css.add(hidden, "MatcToolbarTableHidden");
			parent.appendChild(hidden);
			hidden.focus();

			setTimeout(() => {
				const pastedValue = hidden.value;
				if (pastedValue.indexOf("\n") > 0) { // (pastedValue.indexOf(",") > 0 || pastedValue.indexOf("\t") > 0)
					this._importCSV(pastedValue, row, column);
				} else {
					if (input) {
						input.value += pastedValue;
					}
				}
				parent.removeChild(hidden);

			}, 20);
		},


		focusInput(r, c) {
			if (this.inputs[r] && this.inputs[r][c]) {
				let input = this.inputs[r][c];
				input.value.length;
				input.focus();
				// input.value = input.value;
			}
			delete this.inputClicked;
		},


		selectInput(r, c) {
			r = Math.max(0, r);
			c = Math.max(0, c);
			this.selection = {
				r: r,
				c: c
			};

			this.unselectAll();

			if (this.inputs[r] && this.inputs[r][c]) {
				let input = this.inputs[r][c];
				css.add(input, "MatcToolbarTableInputFocus");
				if (input.scrollIntoViewIfNeeded) {
					input.scrollIntoViewIfNeeded();
				}
			}
		},

		unselectAll() {
			for (let row = 0; row < this.inputs.length; row++) {
				const inputRow = this.inputs[row];
				for (let col = 0; col < inputRow.length; col++) {
					inputRow[col].blur();
					css.remove(inputRow[col], "MatcToolbarTableInputFocus");
				}
			}
		},

		getCarretPosition(input) {
			if ('selectionStart' in input) {

				// Standard-compliant browsers
				return input.selectionStart;
			} else if (document.selection) {
				// IE
				// input.focus();
				const sel = document.selection.createRange();
				const selLen = document.selection.createRange().text.length;
				sel.moveStart('character', -input.value.length);
				return sel.text.length - selLen;
			}
		},

		/***************************************************
		 * Data
		 ***************************************************/


		parseData(data) {

			/**
			 * for now assume csv
			 */
			if (data.substring) {
				var table = [];
				var lines = data.split("\n");
				for (var i = 0; i < lines.length; i++) {
					var line = lines[i];
					table.push(line.split(","));
				}
				return table;
			} else {
				return data;
			}

		},


		/***************************************************
		 * Resizing
		 ***************************************************/


		onBarPress(c, handle, e) {
			this.stopEvent(e);
			this.dndStartPos = this.getMouse(e);

			this.moveListener = on(win.body(), touch.move, lang.hitch(this, "onBarMove", c));
			this.releaseListener = on(win.body(), touch.release, lang.hitch(this, "onBarRelase", c, handle));

			css.add(this.domNode, "MatcToolbarTableReizeCol");
			css.add(handle, "MatcToolbarTableColumnHandleSelected");
			return false;
		},

		onBarMove(c, e) {
			this.stopEvent(e);

			const pos = this.getMouse(e);
			const dif = this.dndStartPos.x - pos.x;
			const w = this.columnWidths[c] - dif;

			if (this.columnTDs[c]) {
				this.columnTDs[c].style.width = w + "px";
			}

			let sum = w
			for (let i = 0; i < this.columns; i++) {
				if (this.columnWidths[i] && i !== c) {
					sum += this.columnWidths[i]
				}
			}
			if (sum > this.maxWidth) {
				this._table.style.width = sum + 'px'
			} else {
				this._table.style.width = '100%'
			}
			return false;
		},

		onBarRelase(c, handle, e) {
			const pos = this.getMouse(e);
			const dif = this.dndStartPos.x - pos.x;
			const w = this.columnWidths[c] - dif;
			this.columnWidths[c] = w

			this.renderColumnWidths();

			this.stopEvent(e);
			if (this.moveListener) {
				this.moveListener.remove();
				delete this.moveListener;
			}
			if (this.releaseListener) {
				this.releaseListener.remove();
				delete this.releaseListener;
			}

			css.remove(handle, "MatcToolbarTableColumnHandleSelected");
			css.remove(this.domNode, "MatcToolbarTableReizeCol");
			this.dndStartPos = null;
			this.widthDirty = true;
		},


		renderColumnWidths() {
			let sum = 0
			for (let i = 0; i < this.columns; i++) {
				if (this.columnWidths[i]) {
					this.columnTDs[i].style.width = this.columnWidths[i] + "px";
					sum += this.columnWidths[i]
				}
			}
			if (sum > this.maxWidth) {
				this._table.style.width = sum + 'px'
			} else {
				this._table.style.width = '100%'
			}
		},

		getMouse(e) {
			const result = {};
			result.x = e.pageX;
			result.y = e.pageY;
			return result;
		},

		getDimensions() {
			var maxC = 0;
			var maxR = 0;
			for (var r = 0; r < this.inputs.length; r++) {
				var inputRow = this.inputs[r];
				var add = false;
				for (var c = 0; c < inputRow.length; c++) {
					var value = this.inputs[r][c].value;
					if (value) {
						maxC = Math.max(maxC, c);
						add = true;
					}
				}
				if (add) {
					maxR = r;
				}
			}
			return { c: maxC + 1, r: maxR + 1 };
		},


		/***************************************************
		 * Upload Methods
		 ***************************************************/

		_importCSV(data, r_offset, c_offset) {
			var table = this.getData();
			var lines = data.split("\n");
			for (var r = 0; r < lines.length; r++) {
				var line = lines[r];

				var row;
				if (line.indexOf("\t") > 0) {
					row = line.split("\t");
				} else {
					row = line.split(",");
				}

				for (var c = 0; c < row.length; c++) {
					if (!table[r + r_offset]) {
						table[r + r_offset] = [];
					}
					table[r + r_offset][c + c_offset] = row[c];
				}
			}
			this.dataDirty = true;
			this.onChange()
			this.renderData(table);
		},

		initWidths() {
			for (let c = 0; c < this.columns.length; c++) {
				this.columnWidths[c] = this.columns[c].width;
			}
		},

		destroy() {

			this.cleanUpTempListener();
		}
	},
	mounted() {
		if (this.tableData) {
			this.data = lang.clone(this.tableData)
		}
		this.initWidths()
		this.render()
		this.renderData(this.data)
		this.renderColumnWidths();
	}
}
</script>