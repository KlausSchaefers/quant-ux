import Logger from 'common/Logger'

class RestEngine {

    constructor () {
        this.logger = new Logger("RestEngine")
    }
    
    run (request, data) {
        if (request.method === "POST" && request.input.type === 'JSON') {
            return this.postOrPut(request, data)
        }
        if (request.method === "POST" && request.input.type === 'IMAGE') {
            return this.postOrPostImage(request, data)
        }
        if (request.method === "GET") {
            return this.get(request, data)
        }
        if (request.method === "PUT" && request.input.type === 'JSON') {
            return this.postOrPut(request, data)
        }
        if (request.method === "PUT" && request.input.type === 'IMAGE') {
            return this.postOrPostImage(request, data)
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

    buildData (request, values) {
        let data = this.fillString(request.input.template, values);
        this.logger.log(1, "buildData", "exit" ,data)
        return data;
    }

    fillString (s, values) {
        for (let key in values) {
            let pattern = "${" + key + "}"
            let i = 0 
            while(s.indexOf(pattern) >= 0 && i < 100) {
                s = s.replace(pattern, values[key])
                i++
            }
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
            if (request.output.type === "IMAGE") {
                response.arrayBuffer().then((buffer) => {
                    resolve(buffer)
                });
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

    postOrPostImage (request, values) {
        let url = this.buildURL(request, values)
        let header = this.createDefaultHeader(request)

        const formData = new FormData()
        for (let key in values) {
            formData.append(key, values[key])
        }
        return new Promise( (resolve, reject) => {
            fetch(url, {
                method: request.method,
                mode: 'cors',
                cache: 'no-cache', 
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer',
                body: formData
            })
            .then(response => {
                this.handleOutput(resolve, request, response)
            }).catch (e => {
                reject(e)
                throw e;
            });
        })
    }

    postOrPut (request, values) {
        let url = this.buildURL(request, values)
        let data = this.buildData(request, values)
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
        if ((rest.method === 'POST' || rest.method === 'PUT') && rest.input.type === 'IMAGE') {
            if (rest.input.fileDataBinding) {
                result.push(rest.input.fileDataBinding)
            }
        }
        return result;
    }

    parseString (s, result) {
        let matches = s.match(/\$\{(.*)\}/g)
        if (matches) {
            matches.forEach(m => {
                let variable = m.substring(2, m.length -1)
                if (result.indexOf(variable) < 0) {
                    result.push(variable)
                }
            })
        }
    }
}
export default new RestEngine()