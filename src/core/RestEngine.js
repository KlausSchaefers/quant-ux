import Logger from 'common/Logger'

class RestEngine {

    constructor () {
        this.logger = new Logger("RestEngine")
    }

    run (request, data) {

        if (request.method === "POST" && (request.input.type === 'JSON' || request.input.type === 'FORM')) {
            return this.postOrPut(request, data)
        }
        if (request.method === "POST" && (request.input.type === 'IMAGE' || request.input.type === 'FILE')) {
            return this.postOrPostImage(request, data)
        }
        if (request.method === "GET") {
            return this.get(request, data)
        }
        if (request.method === "PUT" && request.input.type === 'JSON') {
            return this.postOrPut(request, data)
        }
        if (request.method === "PUT" && (request.input.type === 'IMAGE' || request.input.type === 'FILE')) {
            return this.postOrPostImage(request, data)
        }
        if (request.method === "DELETE") {
            return this.delete(request, data)
        }
    }

    async buildURL (request, values) {
        let url = await this.fillString(request.url, values, false);
        this.logger.log(1, "buildURL", "exit" ,url)
        return url;
    }

    async buildData (request, values) {
        let data = await this.fillString(request.input.template, values, true);
        this.logger.log(1, "buildData", "exit", data)
        return data;
    }

    async buildToken (request, values) {
        let data = await this.fillString(request.token, values, true);
        this.logger.log(1, "buildToken", "exit", data)
        return data;
    }

    async fillString (s, values, encodeFiles = true) {
        for (let key in values) {
            let value = await this.getStringFilelValue(values[key], encodeFiles)
            let pattern = "${" + key + "}"
            let i = 0
            while(s.indexOf(pattern) >= 0 && i < 100) {
                s = s.replace(pattern, value)
                i++
            }
        }
        if (s.indexOf('${') >= 0){
            this.logger.error("buildURL", "exit" ,s)
            throw new Error("buildURL() > Not all parameters replaced!" + s)
        }
        return s
    }

    getStringFilelValue (value, encodeFiles) {
        // FIXME: check if we contain ${} to avoid messz stuff
        if (value && value.name && value.size && encodeFiles) {
            value = this.readFileAsBase64(value)
        }
        return value
    }

    async readFileAsBase64 (file) {
        let result = await this.base64(file)
        return result
    }

    dataUrl (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = error => reject(error);
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    base64 (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = error => reject(error);
            reader.onload = () => {
                let bytes = Array.from(new Uint8Array(reader.result));
                let base64StringFile = btoa(bytes.map((item) => String.fromCharCode(item)).join(""));
                resolve(base64StringFile);
            }
            reader.readAsArrayBuffer(file);
        });
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
        return new Promise( async (resolve, reject) => {
            let url = await this.buildURL(request, values)
            let header = await this.createDefaultHeader(request, values)

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
        return new Promise( async (resolve, reject) => {
            let url = await this.buildURL(request, values)
            let header = await this.createDefaultHeader(request, values)

            const formData = new FormData()
            for (let key in values) {
                formData.append(key, values[key])
            }

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
        return new Promise( async (resolve, reject) => {

            let url = await this.buildURL(request, values)
            let data = await this.buildData(request, values)
            let header = await this.createDefaultHeader(request, values)

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
        return new Promise( async (resolve, reject) => {
            let url = await this.buildURL(request, values)
            let header = await this.createDefaultHeader(request, values)

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

    async createDefaultHeader(request, values) {
        let token = await this.buildToken(request, values)
        let authType= request.authType ? request.authType : 'Bearer'
        if (request.input.type === 'JSON') {
            let headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${authType} ${token}`
            }
            return headers
        }
        else if(request.input.type === 'FORM') {
            let headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `${authType} ${token}`
            }
            return headers
        }
        return new Headers({
            'Authorization': `${authType} ${token}`
        })
    }

    getNeededDataBings (rest) {
        let result = []
        this.parseString(rest.url, result)
        this.parseString(rest.token, result)
        if ((rest.method === 'POST' || rest.method === 'PUT') && (rest.input.type === 'JSON' || rest.input.type === 'FORM')) {
            this.parseString(rest.input.template, result)
        }
        if ((rest.method === 'POST' || rest.method === 'PUT') && (rest.input.type === 'FILE' || rest.input.type === 'IMAGE')) {
            if (rest.input.fileDataBinding) {
                result.push(rest.input.fileDataBinding)
            }
        }
        return result;
    }

    parseString (s, result) {
        let matches = s.match(/\$\{(.*?)\}/g)
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