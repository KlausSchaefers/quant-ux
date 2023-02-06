import Logger from '../core/Logger'

export default class SwaggerService {

    constructor () {

    }


    async parseURL (url) {
        Logger.log(-1, 'SwaggerService.loadSwagger()', url)
        let swagger = await this.get(url)
        return this.parseJSON(swagger)
    }

    parseJSON(swagger) {
        console.debug(swagger)
        const schema = swagger.components.schemas

        return [[], schema]
    }

    async get (url) {
        Logger.log(1, 'get() > enter :' + url)
        return new Promise ((resolve, reject) => {
          fetch(url, {
            method: 'get'
          }).then(resp => {
            if (resp.status === 200) {
              resp.json().then(json => {
                resolve(json)
              })
            } else {
              reject(new Error('Wrong Status'))
            }
          }, err => {
            reject(err)
          })
        })
    }

}
