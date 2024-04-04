
import Controller from '../../src/canvas/controller/Controller'
import ModelFactory from "../../src/core/ModelFactory";
import MockModelService from './mocks/MockModelService'
import lang from "../../src/dojo/_base/lang";

export function createController (model) {

    requestAnimationFrame = (callback => callback())

    model = lang.clone(model)
    const factory = new ModelFactory();
    factory.setModel(model);

    const service = new MockModelService()
    const controller =  new Controller()
    controller.setPublic(true)
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
        updateSourceModel () {
            
        },
        showSuccess () {

        },
        render () {
            
        },
        unSelect(){

        }

    }

    return [controller, model]
}

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}