import ScriptAPI from './ScriptAPI'
import Logger from '../Logger'

self.addEventListener('message', e => {
    Logger.log(1, 'ScriptWorker.message() > enter ', e)


    const js = e.data.code
    const model = e.data.model
    const viewModel = e.data.viewModel
    const qux = new ScriptAPI(model, viewModel)
    const code = new Function('qux', js);
    console.debug('------ Custom Logs -------')
    let result = undefined
    try {
        result = code(qux)
        console.debug('--------------------------')
        self.postMessage({
            result: result,
            viewModel: qux.getViewModel(),
            appDeltas: qux.getAppDeltas(),
            status : 'ok'
        })
    } catch (error) {
        console.debug('--------------------------')
        Logger.error(1, 'ScriptWorker.message() > Error', error)
        self.postMessage({
            status: 'error',
            error: error.message
        })
    }
      
  

    Logger.log(1, 'ScriptWoker.message() > exit ')

})