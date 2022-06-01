import Logger from '../core/Logger'

export default class SandBoxService {

    run (js) {
        Logger.log(1, 'SandBoxService.run()')

        // or web worker
        // https://gist.github.com/dfkaye/da49b6c05aed48e6dfb28a2c7e87cf06
        // http://blog.namangoel.com/replacing-eval-with-a-web-worker
        var xxx = ''
        try {

            const qux = {
                save () {
                    console.debug('qux.save')
                }
            }

            let code = new Function('qux', js);
            console.debug('code', code)
            let result = code(qux)
            console.debug('result', result)
        } catch (e) {
            console.error(e)
        }

  
        
        Logger.log(1, 'SandBoxService.run() > exit', xxx)
    }
}