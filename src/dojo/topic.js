class topic {

    constructor () {
        this._dojoTopicListeners = {}
        this._idCounter = 0
    }

    on (name, callback) {
        if (!this._dojoTopicListeners[name]) {
            this._dojoTopicListeners[name] = []
        }
        const id = this._idCounter++
        const listener = {
            'topic': name,
            'callback': callback,
            'id': id,
            'remove': () => {
                this.remove(name, id)
            }
        }
        this._dojoTopicListeners[name].push(listener)
        return listener
    }

    remove (name, id) {
        if (this._dojoTopicListeners[name]) {
            this._dojoTopicListeners[name] = this._dojoTopicListeners[name].filter(l => l.id !== id)
        }
    }

    publish (name, data1, data2, data3, data4, data5, data6) {
        if (this._dojoTopicListeners[name]) {
            let listeners = this._dojoTopicListeners[name]
            listeners.forEach(listener => {
                listener.callback(data1, data2, data3, data4, data5, data6)
            })
        }
    }

    subscribe (name, callback) {
        return this.on(name, callback)
    }
}
export default new topic()