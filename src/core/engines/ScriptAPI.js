import Logger from '../Logger'

class QModel {

}

class QWidget extends QModel {

    constructor (model, api) {
        super()
        this.screenModel = model
        this.api = api
    }

}

class QScreen extends QModel {

    constructor (model, api) {
        super()
        this.screenModel = model
        this.api = api
    }

    getWidget(name) {
        return new QWidget(null, this)
    }
}

export default class ScriptAPI {

    constructor(model, viewModel) {
        Logger.log(-1, "ScriptAPI.constructor() ", viewModel)
        this.model = model
        this.viewModel = viewModel
        this.appDeltas = []
    }

    getScreen(name) {
        return new QScreen(null, this)
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