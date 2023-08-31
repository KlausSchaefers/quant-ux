
<template>
	<div class="MatcValidation">
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import DropDownButton from 'page/DropDownButton'

export default {
	name: 'Validation',
	mixins: [DojoWidget],
	data: function () {
		return {
			widgetType: "textbox"
		}
	},
	components: {},
	methods: {
		postCreate() {
			this.logger = new Logger("Validation");
			this.db = new DomBuilder();
			this.logger.log(0, "postCreate", "enter > " + this.widgetType);
		},


		setModel(model) {
			this.model = model;
		},

		getValidationModel(widget) {
			if (widget.props && widget.props.validation) {
				return widget.props.validation;
			}
			return {};
		},


		setValue(widget) {
			var validation = lang.clone(this.getValidationModel(widget));
			this.widget = widget;
			this.value = validation;
			this.value.type = "custom";

			if (this.widgetType == "date") {
				this.renderDate(this.value);
			} else {
				this.render(this.value);
			}
		},

		getValue() {
			return this.value;
		},

		renderDate(validation) {
			this.domNode.innerHTML = "";
			this.cleanUpTempListener();
			this.db.div("form-group").build(this.domNode);
			var txt = this.db.formGroup("MatcIgnoreOnKeyPress", "Correct Date", validation.date, "dd.mm.yyyy").build(this.domNode);
			this.tempOwn(on(txt, "keyup", lang.hitch(this, "setDate", txt)));
		},

		setDate(input) {
			var value = input.value;
			this.value.date = value;
		},

		render(validation) {

			this.domNode.innerHTML = "";
			this.cleanUpTempListener();
			var row = this.db.div("form-group").build(this.domNode);

			this.db.label(null, "Data Type").build(row);

			var drpBox = this.$new(DropDownButton, { maxLabelLength: 25 });
			drpBox.setOptions([
				{ "value": "string", label: "Text" },
				{ "value": "int", label: "Number" },
				{ "value": "double", label: "Decimal" }
			]);
			drpBox.setValue(validation.subtype)
			drpBox.placeAt(row);
			this.tempOwn(on(drpBox, "change", lang.hitch(this, "setSubType")));


			if (!validation.subtype) {
				drpBox.updateLabel = false;
				drpBox.setLabel("Select Data Type");
			}


			if (validation.subtype == "int" || validation.subtype == "double") {

				let min = this.db.formGroup("MatcIgnoreOnKeyPress", "Min", validation.min, "").build(this.domNode);
				this.tempOwn(on(min, "keyup", lang.hitch(this, "setMin", min, validation.subtype)));

				let max = this.db.formGroup("MatcIgnoreOnKeyPress", "Max", validation.max, "").build(this.domNode);
				this.tempOwn(on(max, "keyup", lang.hitch(this, "setMax", max, validation.subtype)));
			}

			if (validation.subtype == "string") {

				let row = this.db.div("form-group").build(this.domNode);
				this.db.label(null, "String Matching").build(row);
				let srtTypeBtn = this.$new(DropDownButton, { maxLabelLength: 25 });
				css.add(drpBox.domNode, "MatcButtonLG");

				srtTypeBtn.setOptions([
					{ "value": "equals", label: "Exact Match" },
					{ "value": "contains", label: "Contains Characters" },
					{ "value": "length", label: "Min & Max Length" }
				]);
				srtTypeBtn.setValue(validation.operator);
				srtTypeBtn.placeAt(row);
				this.tempOwn(on(srtTypeBtn, "change", lang.hitch(this, "setOperator")));

				if (!validation.operator) {
					srtTypeBtn.updateLabel = false;
					srtTypeBtn.setLabel("Select String Matching Operator");
				}

				if (validation.operator == "length") {
					let min = this.db.formGroup("MatcIgnoreOnKeyPress", "Min", validation.min, "").build(this.domNode);
					this.tempOwn(on(min, "keyup", lang.hitch(this, "setMin", min, "int")));
					let max = this.db.formGroup("MatcIgnoreOnKeyPress", "Max", validation.max, "").build(this.domNode);
					this.tempOwn(on(max, "keyup", lang.hitch(this, "setMax", max, "int")));
				}

				if (validation.operator == "contains" || validation.operator == "equals") {
					let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Text", validation.text, "").build(this.domNode);
					this.tempOwn(on(text, "keyup", lang.hitch(this, "setText", text)));
				}
			}
		},

		setSubType(value) {
			this.value.subtype = value;
			delete this.value.min;
			delete this.value.max;
			delete this.value.text;
			delete this.value.operator;

			this.render(this.value);

			this._onChange();
		},

		setOperator(value) {
			this.value.operator = value;
			this.render(this.value);
			this._onChange();
		},

		setText(input) {
			this.value.text = input.value;
			this._onChange();
		},


		setMin(input, type) {


			if (type == "int") {
				let min = input.value;
				let re = /^-?[0-9]+$/;
				if (re.test(min)) {
					min = parseInt(min);
					this.value.min = min;
					css.remove(input.parentNode, "has-error");
				} else {
					css.add(input.parentNode, "has-error");
				}
			}


			if (type == "double") {
				let min = input.value;
				let re = /^-?[0-9]+((\.|,)[0-9]+)?$/;
				if (re.test(min)) {
					min = parseInt(min);
					this.value.min = min;
					css.remove(input.parentNode, "has-error");
				} else {
					css.add(input.parentNode, "has-error");
				}
			}

			this._onChange();
		},

		setMax(input, type) {
			if (type == "int") {
				let max = input.value;
				let re = /^-?[0-9]+$/;
				if (re.test(max)) {
					max = parseInt(max);
					this.value.max = max;
					css.remove(input.parentNode, "has-error");
				} else {
					css.add(input.parentNode, "has-error");
				}
			}

			if (type == "double") {
				let max = input.value;
				let re = /^-?[0-9]+((\.|,)[0-9]+)?$/;
				if (re.test(max)) {
					max = parseInt(max);
					this.value.max = max;
					css.remove(input.parentNode, "has-error");

				} else {
					css.add(input.parentNode, "has-error");
				}
			}
			this._onChange();
		},
		_onChange() {
		},

		setError(msg) {
			if (this.errorLbl) {
				this.domNode.removeChild(this.errorLbl);
			}
			this.errorLbl = this.db.div("MatcErrorLabel", msg).build(this.domNode);
		},

		isValid() {

			if (this.widgetType == "date") {
				var re = /^[0-9]{1,2}(\/|-|\.)[0-9]{1,2}(\/|-|\.)[0-9]{2,4}$/;
				return re.test(this.value.date);
			}

			return true;
		}
	},
	mounted() {
	}
}
</script>