import Logger from '../Logger'

export function applyChange(model, change, renderFactory) {
    Logger.log(4, 'ScriptToModel.applyChange()', change, renderFactory)


    let element = getElementByChange(model, change)
    if (element) {
        let old = change.key === 'style' ? element.style : element.props
        let overwrites = change.key === 'style' ? change.style : change.props
        for (let key in overwrites) {
            old[key] = overwrites[key]
        }
        renderFactory.updateWidget(element)

    } else {
        Logger.error('ScriptToModel.applyChanges() > Cannot find element', change)
    }
}


function getElementByChange(model, change) {
    if (change.type === 'Widget') {
        return model.widgets[change.id]
    }
    if (change.type === 'Screen') {
        return model.screens[change.id]
    }
}