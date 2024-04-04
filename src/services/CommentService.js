import AbstractService from 'services/AbstractService'
import Logger from 'common/Logger'

class CommentService extends AbstractService{

    constructor () {
        super()
        this.logger = new Logger('CommentService')
    }

    findAll (appID,) {
 
        return this._get(`rest/comments/apps/${appID}.json`)
        
    }

    findByHash (appID, hash, type) {
        return this._get(`rest/comments/hash/${hash}/${appID}/${type}.json`)
    }

    createByHash (appID, hash, comment){
        return this._post(`rest/comments/hash/${hash}/${appID}`, comment)
    }

    updateByHash (appID, hash, comment){
        return this._post(`rest/comments/hash/${hash}/${appID}/${comment.id}.json`, comment)
    }

    find (appID, type, reference) {
        if (!reference) {
            return this._get(`rest/comments/apps/${appID}/${type}.json`)
        } else {
            return this._get(`rest/comments/apps/${appID}/${reference}/${type}.json`)
        }
    }

    delete (appID, comment) {
        return this._delete(`rest/comments/apps/${appID}/${comment.id}.json`)
    }

    create (appID, comment){
        return this._post(`rest/comments/apps/${appID}`, comment)
    }

    update (appID, comment){
        return this._post(`rest/comments/apps/${appID}/${comment.id}.json`, comment)
    }

}
export default new CommentService()