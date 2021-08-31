import Logger from 'core/Logger'
export default class CollbaService {

  constructor (url, app, jwtToken, ) {
    this.app = app
    this.jwtToken = jwtToken


    let connection = new WebSocket(`${url}/?app=${app}&jwt=${jwtToken}`)

    connection.onmessage = (event) => {
      console.debug('CollbaService.onMessage()', event)
      if (this.onMessageCallback) {
        this.onMessageCallback(event)
      }
    }
    connection.onopen = () => {
      Logger.log(-1, 'CollbaService.onOpen()', app)
      this.connection = connection
    }
  }

  onMessage(callback) {
    this.onMessageCallback = callback
  }

  send (message) {
    Logger.log(-1, 'CollbaService.send()', message)
    if (this.connection) {
      this.connection.send(message)
    }
  }

}