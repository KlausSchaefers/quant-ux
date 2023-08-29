<template>
	<div ref="containerNode"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget"
import css from "dojo/css"
import lang from "dojo/_base/lang"
import query from "dojo/query"
import on from "dojo/on"
import domAttr from "dojo/domAttr"
import DomBuilder from "common/DomBuilder"
import CheckBox from "common/CheckBox"
import registry from "dojo/registry"
import DataBinding from "common/DataBinding"
import Logger from "common/Logger"

export default {
	name: "Form",
	mixins: [DojoWidget],
	data: function() {
		return {
			model: null,
		}
	},
	components: {},
	methods: {
		/**
		 * Must be called before Form is added to dom!
		 */
		render (elements, actions) {
			var db = new DomBuilder()
			var cntr = db.div().build()

			var focusInput = null

			for (let i = 0; i < elements.length; i++) {
				var element = elements[i]

				var grp = db.div("form-group").build(cntr)

				var input = this._createInput(element, db, grp)
				domAttr.set(input, "data-binding", element.name)

				if (element.required) {
					domAttr.set(input, "data-binding-required", "true")
				}

				if (element.min) {
					domAttr.set(input, "data-binding-min-length", element.min)
				}

				if (element.empty) {
					domAttr.set(input, "data-binding-empty", "true")
				}

				if (element.error) {
					var error = db.div("", element.error).build(grp)
					domAttr.set(error, "data-binding-error", element.name)
				}

				if (element.onEnter) {
					this.own(on(input, "keypress", lang.hitch(this, "_onKeyPress", element.onEnter)))
				}

				if (element.focus) {
					focusInput = input
				}

				if (element.value) {
					var widget = registry.byNode(input)
					if (widget && widget.setValue) {
						widget.setValue(element.value)
					} else {
						console.warn("No widget  for", element)
					}
				}
			}

			/**
			 * A general error label!
			 */
			this.errorLabel = db.div("VommondFormErrorLabel VommondFormErrorLabelBottom VommondFormErrorLabelHidden", "").build(cntr)
			this.hintLabel = db.div("VommondFormHintLabel VommondFormErrorLabelHidden").build(cntr)

			var bar = db.div("MatcButtonBar").build(cntr)
			this.actionNodes = []
			for (let i = 0; i < actions.length; i++) {
				var action = actions[i]
				var a = db.a(action.css, action.label).build(bar)
				this.own(on(a, "click", lang.hitch(this, "_clickAction", action)))
				this.actionNodes.push(a)
			}

			this.$refs.containerNode.innerHTML == ""
			this.$refs.containerNode.appendChild(cntr)

			if (focusInput) {
				setTimeout(function() {
					focusInput.focus()
				}, 300)
			}
		},

		_createInput(element, db, grp) {
			if (element.type != "check") {
				db.label("", element.label).build(grp)

				let input = db.input("form-control " + element.css, element.value, element.placeholder, element.type).build(grp)

				if (element.feedback) {
					css.add(grp, "has-feedback")
					var link = db.a("form-control-feedback VommondFormFeedback hidden", element.feedback.label).build(grp)
					this.own(
						on(link, "click", function() {
							element.feedback.callback()
						})
					)
					this.own(
						on(input, "focus", function() {
							css.remove(link, "hidden")
						})
					)
				}

				return input
			} else {
				let input = this.$new(CheckBox)
				/**
				 * FIXME This does not work for some shitty
				 * reason. Guess Dojo is overwriting it somehow!
				 */
				if (element.css) {
					css.add(input.domNode, element.css)
				}
				input.placeAt(grp)

				var lbl = db.span("VommondCheckBoxLabel").build(grp)
				lbl.innerHTML = element.label

				return input.domNode
			}
		},

		_onKeyPress: function(action, e) {
			var k = e.keyCode ? e.keyCode : e.which
			if (k == 13) {
				var data = DataBinding.getDataBinding(this.$refs.containerNode)
				action(data)
			}
		},

		_clickAction: function(action) {
			this.log.log(3, "_clickAction", "enter > " + action.label)
			var data = DataBinding.getDataBinding(this.$refs.containerNode)
			action.click(data, this.payload)
		},

		getActionNode: function(i) {
			return this.actionNodes[i]
		},

		showError: function(msg, key) {
			this.log.log(5, "showError", "enter > " + msg + " > " + key)
			if (key) {
				this.setError(false, key, msg)
			} else {
				if (msg) {
					this.errorLabel.innerHTML = msg
					css.remove(this.errorLabel, "VommondFormErrorLabelHidden")
				} else {
					css.add(this.errorLabel, "VommondFormErrorLabelHidden")
				}
			}
		},

		showHint: function(msg) {
			this.log.log(5, "showError", "enter > " + msg + " > ")

			if (msg) {
				this.hintLabel.textContent = msg
				css.remove(this.hintLabel, "VommondFormErrorLabelHidden")
			} else {
				css.add(this.hintLabel, "VommondFormErrorLabelHidden")
			}
		},

		startup () {
			this.log = new Logger("Form")
			this.log.log(0, "startup", "enter")
			this._registerListeners()
		},

		_registerListeners () {
			this.log.log(5, "_registerListeners", "enter")
			var me = this

			this.methodElements = {}
			this.inputElements = {}
			this.widgetElements = {}
			this.checkboxElements = {}
			this.errorElements = {}

			/**
			 * Listener to change events
			 */
			query("*[data-binding]", this.$refs.containerNode).forEach(function(n) {
				me._registerChangeListeners(n)
			})

			/**
			 * Get error bindings
			 */
			query("*[data-binding-error]", this.$refs.containerNode).forEach(function(n) {
				me._registerErrorLabel(n)
			})

			/**
			 * Get method bindings
			 */
			query("*[data-binding-method]", this.$refs.containerNode).forEach(function(n) {
				me._registerMethodListener(n)
			})
		},

		_registerChangeListeners (n) {
			var key = domAttr.get(n, "data-binding")

			this.log.log(5, "_registerChangeListeners", "enter > " + key) + " > "

			if (key) {
				var type = domAttr.get(n, "type")

				/**
				 * widget handling
				 */
				var widget = registry.byNode(n)

				if (widget) {
					this.own(on(widget, "change", lang.hitch(this, "validateForm", widget, false)))
					this.widgetElements[key] = widget
				} else if (type == "checkbox") {
					this.own(on(n, "change", lang.hitch(this, "validateForm", n)))
					this.checkboxElements[key] = n
				} else if (type == "select ") {
					this.own(on(n, "change", lang.hitch(this, "validateForm", widget)))
					this.inputElements[key] = n
				} else {
					this.own(on(n, "change", lang.hitch(this, "validateForm", n)))
					//this.own(on( n, "keyup", lang.hitch(this,"validateForm", n)));
					this.inputElements[key] = n
				}
			}
		},

		_registerMethodListener (n) {
			var key = domAttr.get(n, "data-binding-active")
			if (key == "change") {
				css.add(n, "VommondDataBindingPassive")
				this.methodElements[key] = n
			}
		},

		_registerErrorLabel (n) {
			var key = domAttr.get(n, "data-binding-error")
			if (key) {
				this.log.log(5, "_registerErrorLabel", "enter > " + key)

				this.errorElements[key] = n
				css.add(n, "VommondFormErrorLabel VommondFormErrorLabelHidden")
			} else {
				this.log.error("_registerErrorLabel", "Key " + key + " no supported for data-binding-active")
			}
		},

		validateForm (source, force) {
			this.log.log(3, "validateForm", "enter > " + source + " " + force)

			var valid = true
			for (let name in this.inputElements) {
				let n = this.inputElements[name]
				let v = this.validateInput(n, name)
				valid &= v
				if (source == n || force === true) this.setError(v, name)
			}

			for (let name in this.checkboxElements) {
				let n = this.checkboxElements[name]
				let v = this.validateCheckBox(n, name)
				valid &= v
				if (source == n || force === true) this.setError(v, name)
			}

			for (let name in this.widgetElements) {
				let w = this.widgetElements[name]
				let v = this.validateWidget(w, name)
				valid &= v
				if (source == w || force === true) this.setError(v, name)
			}

			if (valid) {
				for (let m in this.methodElements) {
					let n = this.methodElements[m]
					css.remove(n, "VommondDataBindingPassive")
				}
			} else {
				for (let m in this.methodElements) {
					let n = this.methodElements[m]
					css.add(n, "VommondDataBindingPassive")
				}
			}

			this.emit("change")

			return valid
		},

		setError (valid, name, msg) {
			this.log.log(5, "setError", "enter")
			var lbl = this.errorElements[name]
			if (lbl) {
				if (msg) {
					lbl.innerHTML = msg
				}
				if (!valid) {
					css.remove(lbl, "VommondFormErrorLabelHidden")
				} else {
					css.add(lbl, "VommondFormErrorLabelHidden")
				}
			}
			var input = this.inputElements[name]
			if (input) {
				if (!valid) {
					css.add(input, "VommondFormInputError")
				} else {
					css.remove(input, "VommondFormInputError")
				}
			}
		},

		validateInput (n) {
			this.log.log(5, "validateInput", "enter")
			var value = n.value
			return this.validate(value, n)
		},

		validateCheckBox (n) {
			this.log.log(5, "validateCheckBox", "enter")

			var value = n.checked
			return this.validate(value, n)
		},

		validateWidget (w) {
			this.log.log(5, "validateWidget", "enter")

			var value = null
			if (w.getValue) {
				value = w.getValue()
			} else if (w.get) {
				value = w.get("value")
			}

			return this.validate(value, w.domNode)
		},

		validate (value, n) {
			if (n) {
				var name = domAttr.get(n, "data-binding")
				var required = domAttr.get(n, "data-binding-required")

				//this.log.log(0,"validateInput","The field >" + name  + "< is " + required);

				if (required == "true" && !value) {
					this.log.log(0, "validateInput", "The field >" + name + "< is required!")
					return false
				}

				/**
				 * if value is string, check also for pattern or length
				 */
				if (value != null && value != undefined && value.substring) {
					var min = domAttr.get(n, "data-binding-min-length") * 1
					var empty = domAttr.get(n, "data-binding-empty")

					if (value.length < min) {
						if (empty == "true" && value.length == 0) {
							return true
						}
						this.log.log(5, "validateInput", "The field >" + name + "< is must have at leat  " + min + " chars")
						return false
					}
				}
			}

			return true
		},
		destroy() {
			this.cleanUpTempListener()
		},
	},
	mounted() {},
}
</script>
