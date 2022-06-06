import Logger from '../Logger'
import lang from '../../dojo/_base/lang'

export default class ScriptEngine {

    run (js, model, viewModel) {
        Logger.log(1, 'ScriptEngine.run()')

        return new Promise((resolve, reject) => {


            // or web worker
            // https://gist.github.com/dfkaye/da49b6c05aed48e6dfb28a2c7e87cf06
            // http://blog.namangoel.com/replacing-eval-with-a-web-worker
            // https://blog.openreplay.com/optimizing-the-performance-of-your-vue-apps-using-web-workers
    
            try {
        
                const worker = new Worker(new URL('./ScriptWorker.js', import.meta.url))
                worker.onmessage = (m) => this.onMessage(m, resolve, reject)
                // check if I need to clone. I would expect we pass here the data as value and not reference, 
                // but just to be sure...
                worker.postMessage({
                    code: js, 
                    model: lang.clone(model), 
                    viewModel: lang.clone(viewModel)
                })


                setTimeout(() => {
                    worker.terminate()
                }, 1000)
            
            } catch (error) {
                Logger.error('ScriptEngine.run() > Error', error)
                reject(error.message)
            }
            Logger.log(1, 'ScriptEngine.run() > exit')
        })
    }

    onMessage (message, resolve, reject) {
        Logger.log(1, 'SandBoxService.onMessage() > enter', message.data)
        if (message.data.status === 'error') {
            reject(message.data.error)
        }
        if (message.data.status === 'ok') {
            resolve(message.data)
        }
    }
}