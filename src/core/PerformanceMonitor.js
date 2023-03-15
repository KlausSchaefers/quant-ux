import Logger from './Logger'
class PerformanceMonitor {

    constructor () {
        this.data = {}
        this.entries = []
        this.payloads = {}
    }

    start (key, payload) {
        const start = new Date().getTime()
        this.data[key] = start
        this.payloads[key] = payload
    }

    end (key, logLevel = 2) {
        if (!this.data[key]) {
            Logger.warn('PerformanceMonitor.end() > no key', key)
            return
        }
        const start = this.data[key]
        const end = new Date().getTime()
        const duration = end - start
        this.entries.push({
            duration: duration,
            key: key,
            payload: this.payloads[key]
        })
        if (duration > 1000) {
            Logger.warn('PerformanceMonitor.end() > ' +  key + ' took ' + duration + 'ms')
            console.table(this.entries)
        } else {
            Logger.log(logLevel, 'PerformanceMonitor.end() > ' +  key + ' took ' + duration + 'ms')
        }
        delete this.data[key]
        delete this.payloads[key]
    }

}

export default new PerformanceMonitor()