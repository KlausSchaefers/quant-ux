import Logger from '../../core/Logger'
import * as CollabUtil from './CollabUtil'
import { v4 as uuidv4 } from 'uuid';
import * as MergeUtil from './MergeUtil'

export default class CollabService {

    constructor(appId ='OhOh'){
      Logger.log(2, 'CollabService()', appId)
      this.events = []
      this.appId = appId
    }

    setModel (m) {
      this.appId = m.id
    }

    reset () {
      this.events = []
    }

    createEvent (changes) {
      Logger.log(1, 'CollabService.createEvent()')
      let minichanges = CollabUtil.getMiniChanges(changes, {'lastUUID': 'inc'})
      let event = {
        id:uuidv4(),
        appId: this.appId,
        ts: new Date().getTime(),
        changes: minichanges
      }
      this.pushEvent(event)
      return event
    }

    applyEvent (model, event) {
      Logger.log(1, 'CollabService.applyEvent() > enter', event)
      /**
       * Should we clone???
       */

      if (model.id !== event.appId) {
        Logger.warn('CollabService.applyEvent() > wrong app')
        return model
      }

      /**
       * Should not happen, because of WebSocket, anyhow we check to ensure we do not merge
       * in useless changes
       */
      if (this.events.find(e => e.id === event.id) !== undefined) {
        Logger.log(1,'CollabService.applyEvent() > Event ignored, because it was already added')
        return model
      }

      try {
        let changes = event.changes
        changes.forEach(change => {
          if (change.parent) {
            this.applyInParent(model, change)
          } else {
            this.applyInRoot(model, change)
          }
        })
  
      } catch (err) {
        Logger.error('CollabService.applyEvent() > Opoops', err)
        Logger.error('CollabService.applyEvent() > Opoops', event.changes)        
      }

     
      this.pushEvent(event)


      return model
    }

    applyInRoot( model, change) {
      if (change.type === 'add') {
        Logger.log(1, 'CollabService.applyInRoot() >  add', change)
        model[change.id] = change.value
      }

      /**
       * In case of root updates we send the entire value!
       */
      if (change.type === 'update') {
        Logger.log(1, 'CollabService.applyInRoot() >  update', change)

        let value = change.value
        /**
         * For some values we support isInc function!
         */
        if (value._isInc && value.inc) {
          const o = model[change.id] * 1
          const v = value.inc * 1
          if (!isNaN(v) && !isNaN(o)) {
            model[change.id] = o  + v
            Logger.log(-2, 'CollabService.applyInRoot() >  inc ' + change.id, o  + v)
          } else {
            Logger.error('CollabService.applyInRoot() > Something wrong with INC > ' + value + " + " + model[change.id] )
            if (value.value) {
              model[change.id] = value.value
            } else {
              Logger.error('CollabService.applyInRoot() > INC is complete messed')
            }
          }
        } else {
          model[change.id] = change.value
        }

      }

      if (change.type === 'delete') {
        Logger.log(2, 'CollabService.applyInRoot() >  delete', change)
        if (model[change.id]) {
          delete model[change.id]
        }
      }
    }

    applyInParent(model, change) {
      let parent = model[change.parent]
      if (change.type === 'add') {
        Logger.log(1, 'CollabService.applyInParent() >  add', change)
        if (!parent[change.id]) {
          parent[change.id] = change.value
        } else {
          Logger.log(-1, 'CollabService.applyInParent() >  Object already present', change)
        }
      }

      if (change.type === 'update') {
        Logger.log(1, 'CollabService.applyInParent() >  update', change)
        if (parent[change.id]) {

          const oldValue = parent[change.id]
          const newValue = MergeUtil.applyDelta(oldValue, change.value)
          parent[change.id] = newValue

        } else {
          Logger.log(-1, 'CollabService.applyInParent() >  No object to update', change)
        }
      }

      if (change.type === 'delete') {
        Logger.log(2, 'CollabService.applyInParent() >  delete', change)
        if (parent[change.id]) {
          delete parent[change.id]
        }
      }
    }

    pushEvent(event) {
      if (this.events.length > 50) {
        this.events.shift()
      }
      this.events.push(event)
    }

}