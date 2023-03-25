import Logger from 'common/Logger'
import AbstractService from './AbstractService'

export default class AIService extends AbstractService {


    constructor() {
        super()
        this.logger = new Logger('AIService')
        this.messages = []
    }

    reset () {
        this.messages = []
    }

    async runCodex (message, key) {
        return this.runCompletions(message, key, 'code-davinci-002')
    }

    async runDavinci (message, key) {
        return this.runCompletions(message, key, 'text-davinci-003')
    }

    async runCompletions (message, key, model, temperature = 0, maxTokens = 2000) {

        const prompt =`
            You are HTMLGPT, a masterful webdeveloper. Please create a HTML page for the following
            description:

            ${message}

            Please output a a HTML page.`


        const data = {
            'openAIModel': '/v1/completions',
            'openAIToken': key,
            'openAIOrgID': 'Klaus',
            'openAIPayload': {
                "model": model,
                "prompt": prompt,
                "max_tokens": maxTokens,
                "temperature": temperature
            }
        }

        try {
            const res = await this._post('/ai/openai.json', data)
            console.debug(res)
            if (res.choices && res.choices.length > 0) {
                const choice = res.choices[0]
                const content = choice?.text
                return this.extractHTML(content)
            }
        } catch (err){
            return {
                error: 'design-gpt.error-server'
            }
        }
        return {
            error: 'design-gpt.error-no-idea'
        }
    }
    

    async runGPT35Turbo (message, key, app) {
        const prompt =`
            Please create a HTML page for the following
            description:

            ${message}

            Please output a a HTML page.
        `

        const data = {
            'openAIModel': '/v1/chat/completions',
            'openAIToken': key,
            'openAIOrgID': 'Klaus',
            'openAIPayload': {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are HTMLGPT, a masterful webdeveloper skillful in HTML and CSS"},
                    {"role": "system", "content": `
                        The website you generate should run on a ${app.type} device.
                        The screen with is ${app.screenSize.w} pixel
                    `},
                    {"role": "user", "content": prompt}
                ]
            }
        }
        try {
            const res = await this._post('/ai/openai.json', data)
            if (res.choices && res.choices.length > 0) {
                const choice = res.choices[0]
                const content = choice?.message?.content
                return this.extractHTML(content)
              
            }
        } catch (err){
            return {
                error: 'design-gpt.error-server'
            }
        }
        return {
            error: 'design-gpt.error-no-idea'
        }
       
    }

    extractHTML (content) {
          
        if (!content) {
            return {
                error: 'error-no-content'
            }
        }
        const start = content.indexOf('html>')
        const end = content.indexOf('</html>')
        if (start > -1 && end > -1) {
            let innerHTML = content.substring(start + 5, end)
            innerHTML = innerHTML.replace('<html>', '')
            return {
                html: `<html>${innerHTML}</html>`
            }
        } 
        return {
            error: 'design-gpt.error-no-html'
        }
    }

}