import Logger from '../core/Logger'
//import Worker from 'worker-loader!./worker'

export default class SandBoxService {

    run (js) {
        Logger.log(1, 'SandBoxService.run()')

     

        // or web worker
        // https://gist.github.com/dfkaye/da49b6c05aed48e6dfb28a2c7e87cf06
        // http://blog.namangoel.com/replacing-eval-with-a-web-worker
        // https://blog.openreplay.com/optimizing-the-performance-of-your-vue-apps-using-web-workers
   
        try {
     
            const worker = new Worker('/worker/Sandbox.js') // or load hard from disk?
            console.debug(worker)
            worker.onmessage = (m) => this.onMessage(m)
            worker.postMessage({"code": js})
         
        } catch (e) {
            console.error(e)
        }

  
        
        Logger.log(1, 'SandBoxService.run() > exit')
    }

    onMessage (message) {
        console.debug('message', message)
    }
}