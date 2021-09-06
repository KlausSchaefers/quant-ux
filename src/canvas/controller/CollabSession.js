import Logger from '../../core/Logger'
import WebSocketService from '../../services/WebSocketService'

export default class CollabSession {

  constructor (user) {
    this.user = user
    this.collabUsers = []
  }

  initWebsocket(model, canvas, controller, toolbar) {
    Logger.log(-1, "BusService.initWebsocket()", "enter");
    try {
      let user = this.user
      let websocket = new WebSocketService('wss://ws.quant-ux.com', model.id, user.token, user)
      websocket.onMessage(msg => this.dispatchWebSocketMessage(canvas, controller, toolbar, user, msg))
      websocket.init(success => {
        if (success) {
          //canvas.showSuccess('Collaborative editing initiated! (BETA)')
          this.sendHello()
        }
        canvas.setMouseListener(pos => {
          this.sendMouse(pos)
        })
        controller.setModelChangeListener(changeEvent => {
          this.sendChange(changeEvent)
        })
      })

      this.websocket = websocket
    } catch (err) {
      Logger.error('CollabSession.initWebsocket()', "Cannot init WebSocket", err)
    }
  }

  hasOtherUsers () {
    let others = this.collabUsers.find(u => u.id !== this.user.id)
    return others !== undefined
  }


  sendChange (changeEvent) {
    Logger.log(-1, "CollabSession.sendChange()", "enter", changeEvent);
    /**
     * We do not want to overload our websocket server,
     * so we just send events if there is another user.
     */
    if (this.websocket && this.hasOtherUsers()) {
      Logger.log(-1, "CollabSession.sendChange()", "send", changeEvent);
      this.websocket.send({type: 'change', changeEvent: changeEvent})
    } else {
      Logger.log(-1, "CollabSession.sendChange()", "NOT SEND");
    }
  }

  sendMouse (pos) {
    /**
     * We do not want to overload our websocket server,
     * so we just send events if there is another user.
     */
    if (this.websocket && this.hasOtherUsers()) {
      //Logger.log(-5, "CollabSession.sendMouse()", "enter");
      this.websocket.send({type: 'mouse', pos: pos})
    }
  }

  sendBye () {
    Logger.log(-1, "CollabSession.sendBye()", "enter");
    if (this.websocket) {
      this.websocket.send({type: 'bye'})
    }
  }

  sendHello () {
    Logger.log(2, "CollabSession.sendHello()", "enter");
    if (this.websocket) {
      this.websocket.send({type: 'hello'})
    }
  }

  sendImHere () {
    Logger.log(2, "CollabSession.sendImHere()", "enter");
    if (this.websocket) {
      this.websocket.send({type: 'imhere'})
    }
  }

  dispatchWebSocketMessage (canvas, controller, toolbar, user, msg) {

    if (msg.type === 'hello') {
        Logger.log(2, "CollabSession.dispatchWebSocketMessage()", "hello");
        toolbar.addCollabUser(msg.user)
        canvas.addCollabUser(msg.user)
        this.addCollabUser(msg.user)
        this.sendImHere()
    }
    if (msg.type === 'imhere') {
      Logger.log(2, "CollabSession.dispatchWebSocketMessage()", "imhere");
      toolbar.addCollabUser(msg.user)
      canvas.addCollabUser(msg.user)
      this.addCollabUser(msg.user)
    }
    if (msg.type === 'bye') {
      Logger.log(2, "CollabSession.dispatchWebSocketMessage()", "bye");
      toolbar.removeCollabUser(msg.user)
      canvas.removeCollabUser(msg.user)
      this.removeCollabUser(msg.user)
    }
    if (msg.type === 'mouse') {
      //Logger.log(2, "CollabSession.dispatchWebSocketMessage()", "mouse");
      canvas.setCollabMouse(msg.user, msg.pos)
    }

    if (msg.type === 'change') {
      Logger.log(-1, "CollabSession.dispatchWebSocketMessage()", "change");
      controller.collabRecieveChanges(msg.user, msg.changeEvent)
    }
  }


  addCollabUser (user) {
    Logger.log(-1, "CollabSession.addCollabUser()", user);
    const found = this.collabUsers.find(u => u.id === user.id)
    if (!found) {
      this.collabUsers.push(user)
    }
  }

  removeCollabUser (user) {
    Logger.log(-1, "CollabSession.removeCollabUser()", user);
    this.collabUsers = this.collabUsers.filter(u => u.id !== user.id)
  }

  close () {
    Logger.log(-1, "CollabSession.dispatchWebSocketMessage()", "close");
    if (this.websocket) {
      this.websocket.close()
    }
  }
}