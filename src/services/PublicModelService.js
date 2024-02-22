import {ModelService} from './ModelService'
import Logger from '../common/Logger'

/**
 * Model service for the exampole section taht doe snot test anything
 */
class PublicModelService extends ModelService{

    constructor () {
        super()
        this.logger = new Logger('PublicModelService')
    }

    findApp (id) {
        return this._get(`/examples/apps/${id}.json`)
    }

    findAppByHash (hash) {
        return this._get(`/examples/invitation/${hash}/app.json`)
    }

    getCommands (id) {
        return this._get(`/examples/commands/${id}.json`)
    }

    saveCommands () {
        return
    }


    findEvents (id) {
        return this._get(`/examples/events/${id}.json?exclude=Animation`)
    }

    findEventsBySession (id, session) {
        return this._get(`/examples/events/${id}/${session}.json`)
    }

    findMouse (id) {
        return this._get(`/examples/mouse/${id}.json`)
    }

    findMouseBySession (id, session) {
        return this._get(`/examples/mouse/${id}/${session}.json`)
    }

    findSessionAnnotations (id) {
        return this._get(`/examples/annotations/apps/${id}/session.json`)
    }

    findTest (id) {
        return this._get(`/examples/test/${id}.json`)
    }

    findTestByHash (app, hash) {
        return this._get(`/examples/invitation/${app.id}/${hash}/test.json`)
    }

    updateEvent () {
    }



    _post() {
        return new Promise((resolve) => {
            resolve()
        })
    }

    _put() {
        return new Promise((resolve) => {
            resolve()
        })
    }

    _delete() {
        return new Promise((resolve) => {
           resolve()
        })
    }

}
export default new PublicModelService()