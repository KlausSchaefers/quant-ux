export default class Evented {

    constructor() {
        this._dojoWidgetEventListener = []
        this._dojoOwnListeners = []
        this._dojoWidgetEventListenerIds = 0
    }

    stopEvent(e) {
        if (e && e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    own(listener) {
        if (!listener){
            console.warn('Evented.own() > passed null', new Error().stack)
        } else {
            this._dojoOwnListeners.push(listener)
        }
    }

    cleanUpEvented() {
        this._dojoCleanUpEvent()
        this._dojoCleanUpOwn()
    }

    emit(event, value1, value2, value3, value4, value5) {
        if (this.$emit) {
            this.$emit(event, value1, value2, value3, value4, value5);
        }
        if (this._dojoWidgetEventListener[event]) {
            let listeners = this._dojoWidgetEventListener[event];
            listeners.forEach(listener => {
                listener.callback(value1, value2, value3, value4, value5);
            });
        }
    }

    _dojoCleanUpEvent() {
        for (let key in this._dojoWidgetEventListener){
            let listeners = this._dojoWidgetEventListener[key]
            listeners.forEach(l => {
                try {
                    l.remove();
                } catch (e) {
                console.error("DojoWidget._dojoCleanUpOwn() >> ERROR", e);
                }
            })
        }
    }

    _dojoCleanUpOwn() {
        this._dojoOwnListeners.forEach(l => {
            try {
                l.remove();
            } catch (e) {
                console.error("Evented._dojoCleanUpOwn() >> ERROR", e);
            }
        });
    }

    on(event, callback) {
        if (!this._dojoWidgetEventListener[event]) {
            this._dojoWidgetEventListener[event] = [];
        }
        let id = this._dojoWidgetEventListenerIds++
        let listener = {
            'event': event,
            'callback': callback,
            'id': id,
            'remove': () => {
                this._removeListener(event, id)
            }
        }
        this._dojoWidgetEventListener[event].push(listener);
        return listener
    }

    _removeListener(event, id) {
        if (this._dojoWidgetEventListener[event]) {
            this._dojoWidgetEventListener[event] = this._dojoWidgetEventListener[event].filter(l => l.id !== id)
        }
    }
}