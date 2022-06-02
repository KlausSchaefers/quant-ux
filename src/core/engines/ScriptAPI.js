import Logger from '../Logger'

class QModel {

    constructor (model, api, type) {
        this.qModel = model
        this.api = api
        this.type = type
    }

    getName() {
        return this.qModel.name
    }

    setStyle(newStyleDelta) {
        this.api.appDeltas.push({
            type: this.type,
            id: this.qModel.id,
            style: newStyleDelta
        })
    }

}

class QWidget extends QModel {

    constructor (model, api) {
        super(model, api, 'Widget')
    }

}

class QScreen extends QModel {

    constructor (model, api) {
        super(model, api, 'Screen')
    }

    getWidget(name) {
        Logger.log(-1, "QScreen.getWidget() ", name)
        const children = this.qModel.children
        for (let i =0; i < children.length; i++) {
            const widgetId = children[i]
            const widget = this.api.app.widgets[widgetId]
            if (widget && widget.name === name) {
                return new QWidget(widget, this)
            }
        }

        
    }
}

export default class ScriptAPI {

    constructor(app, viewModel) {
        Logger.log(-1, "ScriptAPI.constructor() ", viewModel)
        this.app = app
        this.viewModel = viewModel
        this.appDeltas = []
    }

    getScreen(name) {
        const found = Object.values(this.app.screens).filter(s => s.name === name)
        if (found.length === 1) {
            return new QScreen(found[0], this)
        }
    }

    setViewModel (viewModel) {
        Logger.log(-1, "ScriptAPI.setViewModel() ", viewModel)
        this.viewModel = viewModel
    }

    getViewModel () {
        return this.viewModel
    }

    getAppDeltas () {
        return this.appDeltas
    }

}