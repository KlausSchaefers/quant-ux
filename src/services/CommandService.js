import Logger from "../common/Logger";
import AbstractService from "./AbstractService";

export class CommandService extends AbstractService {

  constructor() {
    super();
    this.logger = new Logger('CommandService')
  }


  loadChangeStack(appID) {
    this.logger.log(1, 'loadChangeStack', 'enter', appID)

    const saved = localStorage.getItem('quxCommandStack')
    if (saved) {
      this.stacks = JSON.parse(saved)
    } else {
      this.stacks = {}
    }


    // we keep only 2 stacks in local storage to ensure
    // we don't get some issue with using to much memory.
    this.stacks = this.pruneStacks(this.stacks)
    this.logger.log(1, 'loadChangeStack', 'enter', this.stacks)
    const found = this.stacks[appID]
    return found
  }

  pruneStacks (stacks, max=2) {
    const values = Object.values(stacks)
    if (values.length > max) {
      const sorted = values.toSorted((a, b) => {
        return a.modified - b.modified
      })
      const toDelete = sorted.slice(0, values.length - max)
      toDelete.forEach(s => {
        this.logger.warn("pruneStacks", "enter > prune " + s.appID)
        delete stacks[s.appID]
      })
    }
    return stacks
  }

  storeChangeStack(appID, stack) {
    this.logger.log(3, 'storeChangeStack', 'enter', stack)
    setTimeout(() => {
      try {
        stack.modified = new Date().getTime()
        this.stacks[appID] = stack
        localStorage.setItem('quxCommandStack', JSON.stringify(this.stacks))
        this.logger.log(2, 'storeChangeStack', 'enter saved')
      } catch (e) {
        this.logger.error('storeChangeStack', 'Could not save', e)
      }
    }, 200)
  }

  /**
   * Commands
   */

  getCommands(id) {
    return this._get(`/rest/commands/${id}.json`);
  }

  saveCommands(id, stack) {
    return this._post(`/rest/commands/${id}.json`, stack);
  }

  addCommand(model, command) {
    return this._post(`/rest/commands/${model.id}/add`, command);
  }

  deleteCommand(model, count) {
    return this._delete(`/rest/commands/${model.id}/pop/${count}`);
  }

  shiftStack(model, count) {
    return this._delete(`/rest/commands/${model.id}/shift/${count}`);
  }

  undoCommand(model, command) {
    return this._post(`/rest/commands/${model.id}/undo`, command);
  }

  redoCommand(model, command) {
    return this._post(`/rest/commands/${model.id}/redo`, command);
  }
}

export default new CommandService()