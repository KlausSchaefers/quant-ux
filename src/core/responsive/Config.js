import * as Util from './ExportUtil'

class Config {

	constructor() {

	}

	getDefault() {
		return {
			fixStartEnd: true,
			debug: {
				logLevel: 0,
			},
			designletPrefix: '',
			scrollToTopAfterNavigation: true,
			scrollIntoViewOnFocus: false,
			loadFonts: true,
			loadFontsWarning: true,
			figma: {
				varientComponentHoverKey: 'Mouse=Hover',
				varientComponentDefaultKey: 'Mouse=Default',
				downloadVectors: true,
			},
			css: {
				grid: true,
				justifyContentInWrapper: false,
				attachLabels: true,
				huggedCanResize: true,
				hoverEmbeddedLabel: false,
				autoFixThreshold: -1
			},
			router: {
				key: "screenName",
				prefix: "",
			},
			databinding: {
				default: "",
			},
			imageFolder: "/img",
			components: {},
			breakpoints: {
				mobile: {
					min: 0,
					max: 500,
				},
				tablet: {
					min: 501,
					max: 1200,
				},
				desktop: {
					min: 1201,
					max: 1000000,
				},
			},
			meta: {},
			addDefaultDatabinding: true
		}
	}

	merge(config, overwrites) {		
		if (overwrites.addDefaultDatabinding !== undefined) {
			config.addDefaultDatabinding = overwrites.addDefaultDatabinding
		}
		if (overwrites.scrollToTopAfterNavigation !== undefined) {
			config.scrollToTopAfterNavigation = overwrites.scrollToTopAfterNavigation
		}
		if (overwrites.scrollIntoViewOnFocus !== undefined) {
			config.scrollIntoViewOnFocus = overwrites.scrollIntoViewOnFocus	
		}
		if (overwrites.css) {
			config.css = Util.mixin(config.css, overwrites.css)
		}
		if (overwrites.router) {
			config.router = Util.mixin(config.router, overwrites.router)
		}
		if (overwrites.databinding) {
			config.databinding = Util.mixin(config.databinding, overwrites.databinding)
		}
		if (overwrites.components) {
			config.components = overwrites.components
		}
		if (overwrites.imageFolder) {
			config.imageFolder = overwrites.imageFolder
		}
		if (overwrites.debug) {
			config.debug = Util.mixin(config.debug, overwrites.debug)
		}
		if (overwrites.designletPrefix) {
			config.designletPrefix = overwrites.designletPrefix
		}
		if (overwrites.loadFonts !== undefined) {
			config.loadFonts = overwrites.loadFonts
		}
		if (overwrites.loadFontsWarning !== undefined) {
			config.loadFontsWarning = overwrites.loadFontsWarning
		}		
		if (overwrites.responsive) {
			config.responsive = overwrites.responsive
		}
		if (overwrites.breakpoints) {
			config.breakpoints = overwrites.breakpoints
		}
		if (overwrites.figma) {
			config.figma = Util.mixin(config.figma, overwrites.figma)
		}
		if (overwrites.meta) {
			config.meta = Util.mixin(config.meta, overwrites.meta)
		}
		return config
	}


}
export default new Config()
