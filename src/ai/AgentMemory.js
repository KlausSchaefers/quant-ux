export default class AgentMemory {

  constructor() {
    this.data = {}
  }

  set(key, value) {
    this.data[key] = value
  }

  get(key) {
    return this.data[key]
  }

  has(key) {
    return this.data[key] !== undefined && this.data[key] !== null
  }

  delete(key) {
    delete this.data[key]
  }

  clear() {
    this.data = {}
  }

  keys() {
    return Object.keys(this.data)
  }
}
