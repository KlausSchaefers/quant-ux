export default class ScriptConsole {

    constructor () {
        this.messages = []
    }

    debug() {
        console.debug('ScriptConsole.debug() > ', arguments[0])
        this.messages.push({
            type: 'debug',
            args: arguments[0]
        })
    }

    log() {
        console.log('ScriptConsole.log() > ', arguments[0])
        this.messages.push({
            type: 'log',
            args: arguments[0]
        })
    }

    warn() {
        console.warn('ScriptConsole.warn() > ', arguments[0])
        this.messages.push({
            type: 'warn',
            args: arguments[0]
        })
    }

    error() {
        console.warn('ScriptConsole.error() > ', arguments[0])
        this.messages.push({
            type: 'error',
            args: arguments[0]
        })
    }
}