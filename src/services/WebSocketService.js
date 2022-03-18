import Logger from 'core/Logger'
import { v4 as uuidv4 } from 'uuid';
export default class WebSocketService {

  constructor (url, appId, jwtToken, user ={} ) {
    this.url = url
    this.appId = appId
    this.user = user
    this.jwtToken = jwtToken
  }

  init (callback) {
    Logger.log(1, 'WebSocketService.init()', this.appId, this.url)
    try {
      let connection = new WebSocket(`${this.url}/?app=${this.appId}&jwt=${this.jwtToken}`)
      connection.onmessage = (event) => {
        this.handleEvent(event)
      }
      connection.onopen = () => {
        Logger.log(-1, 'WebSocketService.init() > Success', this.appId)
        this.connection = connection
        if (callback) {
          callback(true)
        }
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

  handleEvent (event) {
    if (this.messageCallback) {
      try {
        let msg = JSON.parse(event.data)
        this.messageCallback(msg)
      } catch (err) {
        Logger.error('WebSocketService.handleEvent() > cannot handle event', err)
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
    if (this.connection) {
      message.id = uuidv4()
      message.clientTS = new Date().getTime()
      message.appId = this.appId
      message.user = {
        id: this.user.id,
        email: this.user.email,
        name: this.user.name,
        lastname: this.user.lastname,
        image: this.user.image
      }
      this.connection.send(JSON.stringify(message))
      Logger.log(5, 'WebSocketService.send() > exit', message)
    }
  }

  close() {
    Logger.log(-1, 'WebSocketService.close()')
    if (this.connection) {
      this.connection.close()
    }
  }

}