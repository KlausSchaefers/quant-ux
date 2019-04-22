function requestSync (url, params) {
  console.debug('requestSync', url, params)
  let result = null
  let error = null
  var xhr = new XMLHttpRequest()
  xhr.open(params.method, url, false)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Accept', 'application/json')
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      let response = this.response
      if (params.handleAs === 'json') {
        response = JSON.parse(response)
      }
      result = response
    }
  }
  xhr.onerror = function () {
    console.error('requestSync()', this.error)
    error = this.error
  }
  if (params.data) {
    xhr.send(JSON.stringify(params.data))
  } else {
    xhr.send()
  }
  return {
    then (callback, errorCallback) {
      if (error){
        errorCallback(error)
      } else {
        return callback(result)
      }
    }
  }
}

export default function request (url, params) {
    if (params.sync) {
      return requestSync(url, params)
    }
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest()
        xhr.open(params.method, url, true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.setRequestHeader('Accept', 'application/json')
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            let response = this.response
            if (params.handleAs === 'json') {
              response = JSON.parse(response)
            }
            resolve(response)
          } else {
            let response = this.response
            if (params.handleAs === 'json') {
              response = JSON.parse(response)
            }
            reject(response)
          }
        }
        xhr.onerror = function () {
          reject(this.error)
        }
        if (params.data) {
          xhr.send(params.data)
        } else {
          xhr.send()
        }
    })
}