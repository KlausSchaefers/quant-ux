import Logger from '../core/Logger'
import WebSocketService from './WebSocketService'

export default class BusService {

  constructor () {

  }

  initWebsocket(model, canvas, controller, toolbar, user) {
    Logger.log(-1, "BusService.initWebsocket()", "enter", user);
    try {
      let websocket = new WebSocketService('wss://ws.quant-ux.com', model.id, user.token, user)
      websocket.onMessage(msg => this.dispatchWebSocketMessage(canvas, controller, toolbar, user, msg))
      websocket.init(success => {
        if (success) {
          canvas.showSuccess('Collaborative editing initiated! (BETA)')
          this.sendHello()
        }
        canvas.setMouseListner(pos => {
          this.sendMouse(pos)
        })
      })

      this.websocket = websocket
    } catch (err) {
      Logger.error('BusService.initWebsocket()', "Cannot init WebSocket", err)

    }
  }
  sendMouse (pos) {
    Logger.log(5, "BusService.sendMouse()", "enter");
    if (this.websocket) {
      this.websocket.send({type: 'mouse', pos: pos})
    }
  }
  sendBye () {
    Logger.log(-1, "BusService.sendBye()", "enter");
    if (this.websocket) {
      this.websocket.send({type: 'bye'})
    }
  }
  sendHello () {
    Logger.log(2, "BusService.sendHello()", "enter");
    if (this.websocket) {
      this.websocket.send({type: 'hello'})
    }
  }
  sendImHere () {
    Logger.log(2, "BusService.sendImHere()", "enter");
    if (this.websocket) {
      this.websocket.send({type: 'imhere'})
    }
  }
  dispatchWebSocketMessage (canvas, controller, toolbar, user, msg) {

    if (msg.type === 'hello') {
        Logger.log(2, "BusService.dispatchWebSocketMessage()", "hello");
        toolbar.addCollabUser(msg.user)
        this.sendImHere()
    }
    if (msg.type === 'imhere') {
      Logger.log(2, "BusService.dispatchWebSocketMessage()", "imhere");
      toolbar.addCollabUser(msg.user)
    }
    if (msg.type === 'bye') {
      Logger.log(2, "BusService.dispatchWebSocketMessage()", "bye");
      toolbar.removeCollabUser(msg.user)
      canvas.removeCollabUser(msg.user)
    }
    if (msg.type === 'mouse') {
      Logger.log(2, "BusService.dispatchWebSocketMessage()", "mouse");
      canvas.setCollabMouse(msg.user, msg.pos)
    }
  }

  close () {
    Logger.log(-1, "BusService.dispatchWebSocketMessage()", "close");
    if (this.websocket) {
      this.websocket.close()
    }
  }
}