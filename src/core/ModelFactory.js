import lang from '../dojo/_base/lang'

export default class ModelFactory {

	constructor() {
	}

	setModel(model) {
		this.model = model;
		this.screenWidth = model.screenSize.w;
		this.screenHeight = model.screenSize.h;
	}

	createTemplatedModel(param) {

		if (this.model.templates && this.model.templates[param.id]) {

			/**
			 * get the template from somewhere, in this case the model
			 */
			const template = this.model.templates[param.id];

			if (this["createTemplated" + template.templateType]) {
				return this["createTemplated" + template.templateType](template);
			} else {
				console.warn("No create method for template '", template.templateType, "'");
			}

		} else {
			console.warn("No template with id ", param.id);
		}
	}

	createTemplatedWidget(t) {
		const model = {
			id: t.id,
			name: t.name,
			w: t.w,
			h: t.h,
			x: t.x,
			y: t.y,
			z: t.z,
			template: t.id,
			type: t.type,
			props: lang.clone(t.props),
			has: lang.clone(t.has),
			style: {} // do not copy style! this will always be rendered from the template style!
		};
		return model;
	}

	createTemplatedGroup(t) {
		const model = {
			id: t.id,
			name: t.name,
			template: t.id,
			children: lang.clone(t.children)
		};
		return model;
	}

	createAppModel(name, des, type) {

		if (!type) {
			type = {
				type: "smartphone",
				screenSize: {
					w: 375,
					h: 667
				},
				factor: 2
			};
		}

		const grid = 8;
		const model = {
			version: 4,
			name: name,
			description: des,
			screenSize: type.screenSize,
			type: type.type,
			screens: {},
			widgets: {},
			lines: {},
			groups: {},
			templates: {},
			designtokens: {},
			lastUUID: 10000,
			lastUpdate: new Date().getTime(),
			created: 0,
			startScreen: "",
			grid: {
				w: grid,
				h: grid,
				style: "line",
				color: "#cecece",
				visible: false,
				enabled: false
			}
		};
		return model;
	}


	/**********************************************************************
	 * Screen
	 **********************************************************************/

	createScreenModel() {
		const screen = {
			id: null,
			name: "",
			x: 0,
			y: 0,
			w: this.screenWidth,
			h: this.screenHeight,
			z: 0,
			min: {
				h: this.screenHeight,
				w: this.screenWidth
			},
			props: {
				start: false
			},
			style: {},
			has: {
				image: true
			},
			children: []
		};

		return screen;
	}

	/**********************************************************************
	 * Line
	 **********************************************************************/

	createLineModel() {
		const line = {
			id: null,
			from: null,
			to: null,
			points: [],
			event: "click"
		};

		return line;
	}
}