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
        let url = this.fillString(request.url, values);
        this.logger.log(1, "buildURL", "exit" ,url)
        return url;
    }

    fillString (s, values) {
        for (let key in values) {
            s = s.replace("${" + key + "}", values[key])
        }
        if (s.indexOf('${') >= 0){
            this.logger.error("buildURL", "exit" ,s)
            throw new Error("buildURL() > Not all parameters replaced!" + s)
        }
        return s
    }

    handleOutput (resolve, request, response) {
        this.logger.log(2, "handleOutput", "enter" ,response)
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

    getNeededDataBings (rest) {
        let result = []
        this.parseString(rest.url, result)
        this.parseString(rest.token, result)
        if ((rest.method === 'POST' || rest.method === 'PUT') && rest.input.type === 'JSON') {
            this.parseString(rest.input.template, result)
        }
        return result;
    }

    parseString (s, result) {
        let matches = s.match(/\$\{(\w*)\}/g)
        if (matches) {
            matches.forEach(m => {
                result.push(m.substring(2, m.length -1))
            })
        }
    }
}
export default new RestEngine()