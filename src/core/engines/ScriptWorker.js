import ScriptAPI from './ScriptAPI'
import ScriptConsole from './ScriptConsole'
import Logger from '../Logger'

self.addEventListener('message', e => {
    Logger.log(3, 'ScriptWorker.message() > enter ', e)


    const js = e.data.code
    const model = e.data.model
    const viewModel = e.data.viewModel
    const qux = new ScriptAPI(model, viewModel)
    const code = new Function('qux', 'console', js);
    const console = new ScriptConsole()
    console.debug('Start')

    let result = undefined
    try {
        result = code(qux, console)
  
        self.postMessage({
            to: result,
            viewModel: qux.getViewModel(),
            appDeltas: qux.getAppDeltas(),
            console: console.messages,
            status : 'ok'
        })
    } catch (error) {
        Logger.error(1, 'ScriptWorker.message() > Error', error)
        self.postMessage({
            status: 'error',
            console: console.messages,
            error: error.message
        })
    }
      
  

    Logger.log(1, 'ScriptWoker.message() > exit ')

})