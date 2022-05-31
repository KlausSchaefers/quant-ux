import Logger from '../core/Logger'

export default class SandBoxService {

    run (js) {
        Logger.log(1, 'SandBoxService.run()')

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