import Logger from 'common/Logger'
import AbstractService from './AbstractService'

class AIService extends AbstractService {


    constructor() {
        super()
        this.logger = new Logger('AIService')
    }

    async run (message, key) {
        const prompt =`
            You are HTMLGPT, a masterful webdeveloper. Please create a HTML page for the following
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
                "messages": [{"role": "user", "content": prompt}]
            }
        }
        try {
            const res = await this._post('/ai/openai.json', data)
            if (res.choices && res.choices.length > 0) {
                const choice = res.choices[0]
                const content = choice?.message?.content
                
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

                console.error(content)
                return {
                    error: 'design-gpt.error-no-html'
                }
              
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

}

export default new AIService()
