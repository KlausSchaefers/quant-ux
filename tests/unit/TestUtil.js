
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