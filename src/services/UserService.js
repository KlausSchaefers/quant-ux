import AbstractService from 'services/AbstractService'
import Logger from 'common/Logger'

class UserService extends AbstractService{

    constructor () {
        super()
        this.logger = new Logger('UserService')
        this.GUEST = {
            id: -1,
            name: "Guest",
            email: "guest@quant-ux.com",
            role: "guest",
            lastlogin: 0,
            lastNotification: 0,
            tos: false,
            paidUntil: 0,
            plan: "Free"
        }
    }

    signup (data) {
        return this._post('/rest/user', data)
    }

    login (data) {
        return this._post('rest/login/', data)
    }

    save (userID, data) {
        return this._post('rest/user/' + userID + ".json", data) 
    }

    logout () {
        return this._delete('rest/login/') 
    }

    reset (email) {
        return this._post('/rest/user/password/request', {email: email})
    }

    reset2 (email, password, token) {
        let data = {
            email: email,
            password: password,
            key: token
        }
        return this._post('/rest/user/password/set', data)
    }

    retire () {
        this.logger.error('retire', 'THIS IS DEV... Did not retire user...')
        // return this._get('/rest/retire')
    }

    async load () {
        if (!this.user) {
            this.logger.info('getUser()', 'load')
            this.user = await this._get('/rest/user')
        }
        return this.user
    }

    async loadById (id) {
        return await this._get('/rest/user/' + id + '.json')
    }

    getNotications () {
        return this._get('/rest/notifications.json')
    }

    setLastNotication () {
        return this._post('/rest/user/notification/last.json')
    }

    getLastNotication () {
        return this._get('/rest/user/notification/last.json')
    }

    getUser () {
        return this.user
    }

    setUser (u) {
        this.user = u
    }

    contact (name, email, message) {
        return this._post("/rest/contact", {
            name: name, 
            email: email,
            message: message
        })
    }

}
export default new UserService()