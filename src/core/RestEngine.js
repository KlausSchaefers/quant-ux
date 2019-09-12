import Logger from 'common/Logger'

class RestEngine {

    constructor () {
        this.logger = new Logger("RestEngine")
    }
    
    run (request, data) {
        if (request.method === "POST") {
            return this.post(request, data)
        }
        if (request.method === "GET") {
            return this.get(request, data)
        }
        if (request.method === "PUT") {
            return this.put(request, data)
        }
        if (request.method === "DELETE") {
            return this.delete(request, data)
        }
    }

    buildURL (request, values) {
        let url = request.url;
        for (let key in values) {
            url = url.replace("${" + key + "}", values[key])
        }
        if (url.indexOf('${') >= 0){
            this.logger.error("buildURL", "exit" ,url)
            throw new Error("buildURL() > Not all parameters replaced!" + url)
        }
        this.logger.log(-1, "buildURL", "exit" ,url)
        return url;
    }

    handleOutput (resolve, request, response) {
        this.logger.log(-1, "handleOutput", "enter" ,response)
        if (response.status == 200) {
            if (request.output.type === "JSON") {
                try {
                    resolve(response.json())
                } catch (e){
                    throw new Error(`Could not ${request.method} ${request.url}: ${e.message}`)
                }
            }
            if (request.output.type === "TEXT") {
                resolve(response.text())
            }
            return;
        }
        throw new Error(`Could not ${request.method} ${request.url}: ${response.statusText}`)
    }

    get (request, values) {
        let url = this.buildURL(request, values)
        let header = this.createDefaultHeader(request)

        return new Promise( (resolve, reject) => {
            fetch(url, {
                method: "GET",
                mode: 'cors',
                cache: 'no-cache', 
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer'
            })
            .then(response => {
                this.handleOutput(resolve, request, response)
            }).catch (e => {
                reject(e)
            });
        })
    }

    post (request, values) {
        let url = this.buildURL(request, values)
        let data = {}
        let header = this.createDefaultHeader(request)

        return new Promise( (resolve, reject) => {
            fetch(url, {
                method: request.method,
                mode: 'cors',
                cache: 'no-cache', 
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer',
                body: data
            })
            .then(response => {
                this.handleOutput(resolve, request, response)
            }).catch (e => {
                reject(e)
                throw e;
            });
        })
    }

    put (request, values) {
        let url = this.buildURL(request, values)
        let data = {}
        let header = this.createDefaultHeader(request)

        return new Promise( (resolve, reject) => {
            fetch(url, {
                method: "PUT",
                mode: 'cors',
                cache: 'no-cache', 
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer',
                body: data
            })
            .then(response => {
                this.handleOutput(resolve, request, response)
            }).catch (e => {
                reject(e)
                throw e;
            });
        })
    }

    delete (request, values) {
        let url = this.buildURL(request, values)
        let header = this.createDefaultHeader(request)

        return new Promise( (resolve, reject) => {
            fetch(url, {
                method: "DELETE",
                mode: 'cors',
                cache: 'no-cache', 
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer'
            })
            .then(response => {
                this.handleOutput(resolve, request, response)
            }).catch (e => {
                reject(e)
                throw e;
            });
        })
    }
    
    createDefaultHeader(request) {
        if (request.input.type === 'JSON') {
            let headers = new Headers({
                'Content-Type': 'application/json'
            }, {
                'Accept': 'application/json'
            }, {
                'Authorization': `Bearer ${request.token}`
            })
            return headers
        }
        new Headers({
            'Authorization': `Bearer ${request.token}`
        })
    }
}
export default new RestEngine()