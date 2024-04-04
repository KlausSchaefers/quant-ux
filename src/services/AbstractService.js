export default class AbstractService {

    constructor () {
        this.token = null
    }

    setToken (token) {
        this.token = token
    }

    _createDefaultHeader() {
        if (this.token) {
            let headers = new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.token
            })
            this.addHeaders(headers)
            return headers
        } else {
            let headers = new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
            this.addHeaders(headers)
            return headers
        }
    }

    /**
     * Expention point for child classes. The can add custom headers
     * to a request by overwritting this method.
     */
    addHeaders() {}

    _getChached (url, successCallback, errorCallback) {
        this.logger.log(6, '_getChached', 'enter ', url)
        return new Promise((resolve, reject) => {
            /**
             * 1st check cache
             */
            if (this._cache && this._cache[url]) {
                this.logger.log(6, '_getChached', 'exit (cache) ')
                resolve(this._cache[url])
                return
            }


             /**
              * else do fetch
              */
            fetch(url, {
                method: 'get',
                credentials: "same-origin",
                headers: this._createDefaultHeader()
            }).then((res) => {
                if (res.status === 200) {
                    res.json().then(j => {
                        this.logger.log(6, '_getChached', 'exit (fetch)')
                        if (!this._cache) {
                            this._cache = {}
                        }
                        this._cache[url] = j
                        resolve(j)
                        if (successCallback) {
                            successCallback(j)
                        }
                    })
                } else {
                    this.onError(url, res)
                    if (errorCallback) {
                        errorCallback(new Error('Could not load ...'))
                    }
                    reject(new Error('Could not load ' + url))
                }
            }).catch((err) => {
                if (errorCallback) {
                    errorCallback(err)
                }
                reject(err)
            })
        })
    }

    _get(url, successCallback, errorCallback) {
        this.logger.log(6, '_get', 'enter ' + url)
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'get',
                credentials: "same-origin",
                headers: this._createDefaultHeader()
            }).then((res) => {
                if (res.status === 200) {
                    res.json().then(j => {
                        this.logger.log(6, '_get', 'exit ')
                        resolve(j)
                        if (successCallback) {
                            successCallback(j)
                        }
                    })
                } else {
                    this.onError(url, res)
                    if (errorCallback) {
                        errorCallback(new Error('Could not load ...'))
                    }
                    reject(new Error('Could not load ' + url))
                }
            }).catch((err) => {
                if (errorCallback) {
                    errorCallback(err)
                }
                reject(err)
            })
        })
    }

    _post(url, data, successCallback, errorCallback) {
        this.logger.log(6, '_post', 'enter ' + url)
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'post',
                credentials: "same-origin",
                body: JSON.stringify(data),
                headers: this._createDefaultHeader()
            }).then((res) => {
                if (res.status === 200) {
                    res.json().then(j => {
                        this.logger.log(6, '_post', 'exit ')
                        if (successCallback) {
                            successCallback(j)
                        }
                        resolve(j)
                    })
                } else {
                    this.onError(url, res)
                    if (errorCallback) {
                        errorCallback(new Error('Could not _post ...'))
                    }
                    reject(new Error('Could not post ' + url))
                }
            }).catch((err) => {
                if (errorCallback) {
                    errorCallback(err)
                }
                reject(err)
            })
        })
    }

    _put(url, data, successCallback, errorCallback) {
        this.logger.log(6, '_put', 'enter ' + url)
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'put',
                credentials: "same-origin",
                body: JSON.stringify(data),
                headers: this._createDefaultHeader()
            }).then((res) => {
                if (res.status === 200) {
                    res.json().then(j => {
                        this.logger.log(6, '_put', 'exit ')
                        if (successCallback) {
                            successCallback(j)
                        }
                        resolve(j)
                    })
                } else {
                    if (errorCallback) {
                        errorCallback(new Error('Could not _put ...'))
                    }
                    reject(new Error('Could not put ' + url))
                }
            }).catch((err) => {
                this.onError(url)
                if (errorCallback) {
                    errorCallback(err)
                }
                reject(err)
            })
        })
    }

    _delete(url, successCallback, errorCallback, header) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'delete',
                headers: this._createDefaultHeader(header)
            }).then((res) => {
                if (res.status === 200) {
                    res.json().then(j => {
                        this.logger.log(6, '_put', 'exit ')
                        if (successCallback) {
                            successCallback(j)
                        }
                        resolve(j)
                    })
                } else {
                    this.onError(url, res)
                    if (errorCallback) {
                        errorCallback(new Error('Could not delete ...'))
                    }
                    reject(new Error('Could not delete'))
                }
            }).catch(function (err) {
                if (errorCallback) {
                    errorCallback(err)
                }
                reject(new Error('Could not delete'))
            })
        })
    }

    setErrorHandler (handler) {
        this.errorHandler = handler
    }

    onError (url, res) {
        if (this.errorHandler) {
            this.errorHandler(url, res)
        }
    }

}