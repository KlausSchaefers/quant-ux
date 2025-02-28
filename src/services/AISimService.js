import Logger from 'common/Logger'
import AbstractService from './AbstractService'

export default class AISimService extends AbstractService {


    constructor() {
        super()
        this.logger = new Logger('AIService')
        this.messages = []
    }

    reset () {
        this.messages = []
    }

    async run(message, key, app) {
   
        const prompt =`


            Please generate :

            ${app.name}

            ${message}

            
            Return the result as YAML in the defined language. Do not include any additional text.
        `

        const data = {
            'openAIModel': '/v1/chat/completions',
            'openAIToken': key,
            'openAIOrgID': 'Klaus',
            'openAIPayload': {
                "model": 'gpt-4o',
                "messages": [
                    {"role": "system", "content": `
                        You are design GPT. You are really good at deisgn web sites and mobile apps.
                    `},
                    // {"role": "system", "content": `
                    //     The website you generate should run on a ${app.type} device.
                    //     The screen with is ${app.screenSize.w} pixel
                    // `},
                    //{"role": "system", "content": this.getStylePrompt(app, options)},
                    {"role": "user", "content": prompt}
                ]
            }
        }

        return this.runPrompt(data)
    }


   
    async runPrompt (data) {

        try {
            const start = Date.now()
            const res = await this._post('/ai/openai.json', data)
            const end = Date.now()
            this.logger.error('runPrompt() > API took ', end-start)

            if (res.choices && res.choices.length > 0) {
                const choice = res.choices[0]
                const content = choice?.message?.content
                return this.extractEvents(content)                

            }
            if (res.error) { 
                this.logger.error('runPrompt() > Error from API', res)
                if (res.error.code === 'invalid_api_key') {
                    return {
                        error: 'design-gpt.error-server-key'
                    }
                }
                if (res.error.code === 'insufficient_quota') {
                    return {
                        error: 'design-gpt.error-insufficient_quota'
                    }
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


    extractEvents (content) {
        console.debug('extractEvents', content)
        try {
            content = content.split('\n').slice(1, -1).join('\n')
            return {
                yaml: content
            }
        } catch (e) {
            console.debug('extractYAML', content)
            console.error(e)
        }
        return {
            error: 'design-gpt.error-no-yaml'
        }
    }

    getAssistants () {
        return this._get('/v1/assistants')
    }

}