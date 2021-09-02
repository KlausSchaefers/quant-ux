import Logger from 'core/Logger'
export default class WebSocketService {

  constructor (url, appId, jwtToken, ) {
    this.url = url
    this.appId = appId
    this.jwtToken = jwtToken
  }

  init () {
    Logger.log(-1, 'WebSocketService.init()', this.appId, this.url)
    try {
      let connection = new WebSocket(`${this.url}/?app=${this.appId}&jwt=${this.jwtToken}`)
      connection.onmessage = (event) => {
        if (this.messageCallback) {
          this.messageCallback(event)
        }
      }
      connection.onopen = () => {
        Logger.log(-1, 'WebSocketService.init() > Success', this.appId)
        this.connection = connection
      }
      connection.onerror = (err) => {
        Logger.error('WebSocketService.init() > cannot init', err)
        if (this.errorCallback) {
          this.errorCallback(err)
        }
      }
    } catch (err) {
      Logger.error('WebSocketService.constructor() > cannot init', err)
      if (this.errorCallback) {
        this.errorCallback(err)
      }
    }


  }

  onMessage(callback) {
    this.messageCallback = callback
  }

  onError(callback) {
    this.errorCallback = callback
  }

  send (message) {
    Logger.log(-1, 'WebSocketService.send()', message)
    if (this.connection) {
      this.connection.send(JSON.stringify(message))
    }
  }

}