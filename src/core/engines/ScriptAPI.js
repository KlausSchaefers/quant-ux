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
            key: 'style',
            id: this.qModel.id,
            style: newStyleDelta
        })
    }

    setProp(newStyleDelta) {
        this.api.appDeltas.push({
            type: this.type,
            id: this.qModel.id,
            key: 'props',
            props: newStyleDelta
        })
    }

    hide () {
        this.setStyle({display: 'none'})
    }

    isHidden () {
        return this?.qModel?.style?.display === 'none'
    }

    show () {
        this.setStyle({display: 'block'})
    }

    toggle () {
        if (this.isHidden()) {
            this.show()
        } else {
            this.hide()
        }
    }
}

class QWidget extends QModel {

    constructor (model, api) {
        super(model, api, 'Widget')
    }

}

class QGroup extends QModel {

    constructor (model, api) {
        super(model, api, 'Group')
    }

    forEachChild (callback) {
        this.qModel.children.forEach(callback)
    }

    setStyle(newStyleDelta) {
        this.forEachChild(id => {
            this.api.appDeltas.push({
                type: 'Widget',
                key: 'style',
                id: id,
                style: newStyleDelta
            })
        })
    }

    setProp(newStyleDelta) {
        this.forEachChild(id => {
            this.api.appDeltas.push({
                type: 'Widget',
                key: 'props',
                id: id,
                props: newStyleDelta
            })
        })
    }

    isHidden () {
        let hidden = this.qModel.children.filter(id => {
            let widget = this.api.app.widgets[id]
            return widget?.style?.display === 'none'
        })
        return hidden.length === this.qModel.children.length
    }

}


class QScreen extends QModel {

    constructor (model, api) {
        super(model, api, 'Screen')
    }

    getGroup (name) {
        Logger.log(2, "QScreen.getGroup() ", name)
        if (this.api.app.groups) {
            const groups = this.api.app.groups
            const screenChildren = this.qModel.children
            let group = Object.values(groups).find(g => { 
                if (g.name === name) {
                    const groupChildren = g.children
                    const contained = groupChildren.filter(groupChild => screenChildren.indexOf(groupChild) >=0)
                    return contained.length === groupChildren.length
                }
                return false
            })
            if (group) {
                return new QGroup(group, this.api)
            }
        } 
        throw new Error(`Widget "${name}" in screen "${this.qModel.name}" not found.`)
    }

    getWidget(name) {
        Logger.log(2, "QScreen.getWidget() ", name)
        const children = this.qModel.children
        for (let i =0; i < children.length; i++) {
            const widgetId = children[i]
            const widget = this.api.app.widgets[widgetId]
            if (widget && widget.name === name) {
                return new QWidget(widget, this.api)
            }
        }
        throw new Error(`Widget "${name}" in screen "${this.qModel.name}" not found.`)
        
    }
}

export default class ScriptAPI {

    constructor(app, viewModel) {
        Logger.log(2, "ScriptAPI.constructor() ", viewModel)
        this.app = app
        this.appDeltas = []
    }

    getScreen(name) {
        const found = Object.values(this.app.screens).filter(s => s.name === name)
        if (found.length === 1) {
            return new QScreen(found[0], this)
        }
        throw new Error(`Screen "${name}" not found.`)
    }

    vibrate (pattern) {
        this.vibratePattern = pattern
    }

    getAppDeltas () {
        return this.appDeltas
    }

}