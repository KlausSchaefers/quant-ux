import query from 'dojo/query'
import on from 'dojo/on'
import domAttr from 'dojo/domAttr'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import registry from 'dojo/registry'


class DataBinding {
	constructor() {
		this._dataBindingCanDispatch = true
	}
	registerDataBindingListeners(container) {
		var me = this;
		query(".VommondMethodBinding", container).forEach(function (n) {
			console.warn("_DataBinding.registerDataBindingListeners() >> DEPRECTAED: CSS CasedDataBinding");
			var key = domAttr.get(n, "data-method");
			me.tempOwn(on(n, "click", lang.hitch(me, "dispatchBindingMethod", key)));
		});

		query("*[data-binding-method]", container).forEach(function (n) {
			var key = domAttr.get(n, "data-binding-method");
			me.tempOwn(on(n, "click", lang.hitch(me, "dispatchBindingMethod", key, n)));
		});
	}

	getDataBinding(node) {

		if (!node) {
			node = this.content;
		}

		var data = {};
		query("*[data-binding]", node).forEach(function (n) {
			var key = domAttr.get(n, "data-binding");
			var type = domAttr.get(n, "type");
			if (key) {
				/**
				 * widget handling
				 */
				var widget = registry.byNode(n);
				if (widget) {
					if (widget.getValue) {
						data[key] = widget.getValue();
					} else if (widget.get) {
						data[key] = widget.get("value");
					}
				} else if (type == "checkbox") {
					data[key] = n.checked;
				} else if (n.value) {
					data[key] = n.value;
				}
			}
		});

		return data;

	}


	setDataBinding(data, node) {
		if (!node) {
			node = this.content;
		}
		query("*[data-binding]", node).forEach(function (n) {
			var key = domAttr.get(n, "data-binding");
			if (key && data[key] != null && data[key] != undefined) {
				var widget = registry.byNode(n);
				if (widget) {
					widget.setValue(data[key]);
				} else if (n.nodeName.toLowerCase() == "input" || n.nodeName.toLowerCase() == "textarea" || n.nodeName.toLowerCase() == "select") {
					n.value = data[key];

				} else {
					n.innerHTML = data[key];
				}
			}
		});
	}


	dispatchBindingMethod(method, n, e) {
		this.stopEvent(e);


		/**
		 * take out parameters
		 */
		var param = null;
		if (method.indexOf("(") > 0) {
			param = method.substring(method.indexOf("(") + 1, method.length - 1);
			method = method.substring(0, method.indexOf("("));
		}

		if (!css.contains(n, "VommondDataBindingPassive")) {
			if (this[method]) {
				let data = this.getDataBinding();
				if (param) {
					this[method](param, data, e);
				} else {
					this[method](data, e);
				}

			} else {
				if (this.router) {
					let data = this.getDataBinding();
					this.router.dispatch(method, data, e);
				} else {
					this.log.error("dispatchBindingMethod", "No method with name " + method + " or router!");
				}
			}
		} else {
			console.debug("Did not trigger because passive");
		}

	}
}
export default new DataBinding()