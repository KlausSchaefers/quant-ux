import Logger from '../Logger'
import lang from '../../dojo/_base/lang'

export default class ScriptEngine {

    run (js, model, viewModel) {
        Logger.log(-1, 'ScriptEngine.run()')
        this.isDone = false
        return new Promise((resolve, reject) => {

            try {
        
                const worker = new Worker(new URL('./ScriptWorker.js', import.meta.url))
                worker.onmessage = (m) => this.onMessage(m, resolve, reject)
                worker.postMessage({
                    code: js, 
                    model: lang.clone(model), 
                    viewModel: lang.clone(viewModel)
                })


                setTimeout(() => {
                    Logger.log(1, 'ScriptEngine.run() > isDone:', this.isDone)
                    if (!this.isDone) {
                        resolve({
                            status: 'error',
                            error: 'Running too long'
                        })
                    }
                    worker.terminate()
                }, 1000)
            
            } catch (error) {
                Logger.error('ScriptEngine.run() > Error', error)
                resolve({
                    status: 'error',
                    error: error.message
                })
            }
            Logger.log(1, 'ScriptEngine.run() > exit')
        })
    }

    onMessage (message, resolve) {
        Logger.log(-1, 'ScriptEngine.onMessage() > enter', message.data)
        this.isDone = true
        resolve(message.data)
    }
}