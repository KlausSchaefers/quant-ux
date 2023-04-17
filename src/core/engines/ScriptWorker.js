import ScriptAPI from './ScriptAPI'
import ScriptConsole from './ScriptConsole'
import Logger from '../Logger'

self.addEventListener('message', async e => {
    Logger.log(3, 'ScriptWorker.message() > enter ', e)

    const js = e.data.code
    const model = e.data.model
    const viewModel = e.data.viewModel
    const sourceEvent = e.data.sourceEvent
    const qux = new ScriptAPI(model)
    const console = new ScriptConsole()
  
    let result = undefined
    try {
        result = await runCode(js, qux,viewModel, console, sourceEvent)
        self.postMessage({
            to: result,
            viewModel: viewModel,
            appDeltas: qux.getAppDeltas(),
            console: console.messages,
            vibratePattern: qux.vibratePattern,
            status : 'ok'
        })
    } catch (error) {
        Logger.error(1, 'ScriptWorker.message() > Error', error)
        console.error(error)
        self.postMessage({
            status: 'error',
            console: console.messages,
            error: error.message,
            stack: error.stack
        })
    }
    Logger.log(1, 'ScriptWoker.message() > exit ')
})

async function runCode (js, qux,viewModel, console, sourceEvent) {
    if (js.indexOf('await ') > 0) {
        Logger.warn('ScriptWoker.runCode() > enter > ASYNC ', js)
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const aysncJS = `return new Promise(async (resolve) => {
            ${js}
            resolve()
        });`
        console.log('ScriptWoker.runCode() > run aysnc...')
        const asycnCode = AsyncFunction('qux', 'data', 'console', 'event', aysncJS)
        return await asycnCode(qux,viewModel, console, sourceEvent);
    } else {
        Logger.log(-1, 'ScriptWoker.runCode() > enter sync')
        const code = new Function('qux', 'data', 'console', 'event', js);
        return code(qux,viewModel, console, sourceEvent)
    }
}
