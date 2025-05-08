
import Controller from '../../src/canvas/controller/Controller'
import ModelFactory from "../../src/core/ModelFactory";
import MockModelService from './mocks/MockModelService'
import MockCommandService from './mocks/MockCommandService'
import lang from "../../src/dojo/_base/lang";

requestAnimationFrame = function () {}

export function createController (model, data={}) {
    model = lang.clone(model)
    data = lang.clone(data)
    const factory = new ModelFactory();
    factory.setModel(model);

    const service = new MockModelService()
    const comamdnService = new MockCommandService()
    const controller =  new Controller()
    controller.debug = true
    controller.onCommandPageChange = () => {}
    controller.setPublic(true)
    controller.setCommandService(comamdnService)
    controller.setModelService(service);
    controller.setModelFactory(factory);

    controller.setCommandStack({
        "_id" : "6252c2bd406f8516a771585a",
        "stack" : [],
        "pos" : 0,
        "lastUUID" : 10,
        "appID" : model.id,
        "id" : "6252c2bd406f8516a771585a"
    });
    controller.setModel(model)
    controller._canvas = {
        getZoomFactor () {
            return 1
        },
        updateSourceModel () {},
        inlineEditGetCurrent () {},
        setWidgetStyle() {},
        updateWidgetDataView () {},
        showSuccess () {},
        renderSchema() {},
        unSelect() {},
        showError() {}
    }
    controller.toolbar = {
        toolUpdateWidgetButton () {},
        enbaleUndo () {},
        enbaleRedo() {},
        disableUndo() {},
        disableRedo() {},
        updatePropertiesView() {},
        cleanUp() {},
    }

    return [controller, model, data]
}

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

export function printRows(element){
    let rows = element.grid.rows.map((r, i) => {
        return `${r.v}, ${r.l}, ${r.fixed} >> s:${r.start} - e:${r.end}`
    })
    return rows
}


export function printTree(screen, fct = false) {
    let res = []
    printElement(res, screen, '', fct)
    if (screen.fixedChildren && screen.fixedChildren.length > 0) {
        res.push('--------------')
        screen.fixedChildren.forEach(c => {
            printElement(res, c, '*  ', fct)
        })
    }
    return res.join('\n')
}


function printElement(res, e, space='', fct) {
    let actions =''
    if (fct) {
        actions = fct(e)
    }
    //let parent = e.parent ? e.parent.name + ' '  + e.parent._id :  "null"
    let l = e.layout ? e.layout.type : '?'
    res.push(`${space}${e.name} - (${l}) ${actions} `)
    if (e.children) {
        e.children.forEach(c => {
            printElement(res, c, space + '  ', fct)
        });
    }
}

export function findScreen (app, name, result = []) {
    if (app.screens) {
        app.screens.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    return result[0]
}


export function findElementsByName (e, name, result = []) {
    if (e.children) {
        e.children.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    return result
}

export function findOneElementsByName (e, name, result = []) {
    if (e.children) {
        e.children.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    if (e.fixedChildren) {
        e.fixedChildren.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    return result[0]
}