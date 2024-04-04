
<template>
	<div class="VommondInputList">
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import Input from 'common/Input'
import CheckBox from 'common/CheckBox'
import DomBuilder from 'common/DomBuilder'
import {iconDOM} from 'page/QIconUtil'

export default {
	name: 'InputList',
	mixins: [DojoWidget],
	data: function () {
		return {
			inline: true,
			placeholder: "Enter a new value",
			removeIcon: "mdi mdi-close-circle",
			remove: true,
			check: "none",
			add: true,
			newValueMessage: "Enter a value",
			checkNewOption: false,
			edit: true,
			hints: []
		}
	},
	components: {},
	methods: {
		postCreate() {
			this.log = new Logger("InputList");
			this.db = new DomBuilder();
		},

		setHints(h) {
			this.log.log(-1, "setHints()", "enter", h)
			this.hints = h
		},

		setSelected(checked) {
			this.selected = checked;
		},

		blur() {
			if (this.newInput) {
				this.newInput.blur();
			}
			if (this._inputs) {
				for (var i = 0; i < this._inputs.length; i++) {
					this._inputs[i].blur();
				}
			}
		},

		getSelected() {
			this.blur();
			return this.selected;
		},

		setOptions(o) {
			this.options = lang.clone(o);
			this.render();
		},

		getOptions() {
			if (this.newInput) {
				if (this.newInput.value) {
					this.options.push(this.stripHTML(this.newInput.value));
				}
			}
			return this.options;
		},

		render(focusNewElement) {
			this.log.log(0, "render", "enter > " + this.inline);

			this.cleanUpTempListener();
			this.cleanUp();
			this.domNode.innerHTML = "";
			this._inputs = [];
			this._checks = [];

			var tbl = this.db.table("").build();
			var body = this.db.tbody().build(tbl);


			for (let i = 0; i < this.options.length; i++) {
				let option = this.options[i];
				let row = this.db.tr().build(body);
				// make dragable
				row.draggable = "true"
				this.tempOwn(on(row, 'dragstart', e => this.onDragstart(e, i)))
				this.tempOwn(on(row, 'drop', e => this.onDrop(e, i)))
				this.tempOwn(on(row, 'dragover', e => this.onDragOver(e)))

				if (this.check == "single") {
					let checkTd = this.db.td("MatcDialogTableSelectCntr").build(row);
					let chkBox = this.$new(CheckBox);
					chkBox.setValue(this.isSelected(option));
					chkBox.placeAt(checkTd);
					this.tempOwn(chkBox.on("change", lang.hitch(this, "onCheckBoxChange", i, option)));
					this._checks.push(chkBox);
				}

				if (this.edit) {
					let input = this.db.td("VommondInputListInputCntr")
						.input("MatcIgnoreOnKeyPress form-control", this.getLabel(option), this.newValueMessage)
						.build(row);
					this.tempOwn(on(input, "keyup", lang.hitch(this, "onInputChanged", i, input)));
					this.tempOwn(on(input, "change", lang.hitch(this, "onOptionChanged", input, this.isSelected(option))));
					if (this.inline) {
						css.add(input, "");
					}
					this._inputs.push(input);


				} else {
					this.db.td("VommondInputListInputCntr")
						.div("MatcIgnoreOnKeyPress", this.getLabel(option), this.newValueMessage)
						.build(row);
					// this._inputs.push(input);	
				}

				if (this.remove) {
					const remove = this.db.td().div("VommondInputListRemove")
						.build(row);
					
					remove.appendChild(iconDOM('DeleteX'))
					this.tempOwn(on(remove, touch.press, lang.hitch(this, "onInputRemove", i, option)));
				}
			}

			if (this.add) {
				let row = this.db.tr().build(body);
				if (this.check == "single") {
					this.db.td("MatcDialogTableSelectCntr").build(row);
				}

				let td = this.db.td().build(row)
				let input = this.$new(Input, {
					fireOnBlur: true,
					top: true,
					placeholder: "Create a new value",
					inline: this.inline,
					formControl: true
				}) // this.db.td().input("MatcIgnoreOnKeyPress form-control", "", this.placeholder).build(row);
				input.placeAt(td)
				input.setHints(this.hints);
				css.add(input.input, "MatcIgnoreOnKeyPress ");

				if (this.remove) {
					this.db.td().build(row);
				}
				this.tempOwn(input.on("change", lang.hitch(this, "onNewOption", input)));
				this.newInput = input;

				if (focusNewElement || this.options.length == 0) {
					setTimeout(function () {
						input.focus();
					}, 100);
				}
			}


			this.domNode.appendChild(tbl);
		},

		isSelected(option) {
			return this.selected == option;
		},

		getLabel(option) {
			let result = option;
			if (this.labelFCT) {
				result = this.labelFCT(option);
			}
			return this.unStripHTML(result);
		},

		onDragstart(e, i) {
			e.dataTransfer.setData("text", i);
			e.dataTransfer.effectAllowed = 'move';
		},

		onDrop(e, i) {
			e.preventDefault();
			const data = e.dataTransfer.getData("text");
			const j = data * 1
			if (this.options[i] && this.options[j]) {
				const temp = this.options[i]
				this.options[i] = this.options[j]
				this.options[j] = temp
				this.render()
			}
		},

		onDragOver(e) {
			e.preventDefault();
		},

		setLabelFct(fct) {
			this.labelFCT = fct;
		},

		onInputChanged(i, input) {
			this.options[i] = this.stripHTML(input.value);
		},

		onCheckBoxChange(j, option) {

			if (this.isSelected(option)) {
				this._checks[j].setValue(false);
				this.selected = null;
			} else {
				for (var i = 0; i < this._checks.length; i++) {
					this._checks[i].setValue(i == j);
				}
				if (this.edit) {
					this.selected = this._inputs[j].value;
				} else {
					this.selected = option;
				}

			}
		},

		cleanUp() {
			if (this._checks) {
				for (var i = 0; i < this._checks.length; i++) {
					this._checks[i].destroy();
				}
			}
		},

		onOptionChanged(input, isSelected) {
			if (isSelected) {
				this.selected = input.value;
			}
			this.render();
		},

		onNewOption(input, value) {
			if (this.checkNewOption) {
				this.selected = value;
			}
			this.options.push(this.stripHTML(value));
			this.render(true);
		},

		onInputRemove (i, option) {
			if (this.isSelected(option)) {
				this.selected = null;
			}
			this.options.splice(i, 1);
			this.render();
		},

		destroy () {
			this.cleanUpTempListener();
			delete this._inputs;
		}
	},
	mounted() {
	}
}
</script>