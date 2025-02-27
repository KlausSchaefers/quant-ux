import { CommandService } from '../../../src/services/CommandService'

export default class MockCommandService extends CommandService{

    constructor () {
        super()
    }

  loadChangeStack(appID) {
      
      
  }
  
  storeChangeStack(appID, stack) {

  }


    /**
     * Commands
     */

    getCommands (id) {
       
    }

    addCommand (model, command) {
       
    }

    deleteCommand (model, count) {
       
    }

    undoCommand (model, command) {
       
    }

    redoCommand (model, command) {
       
    }

    saveCommands () {}

}