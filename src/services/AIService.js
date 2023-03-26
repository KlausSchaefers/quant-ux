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
    
    runFake() {
        return {html:`
            <html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login Page</title>
                    <style>
                        *{
                            box-sizing: border-box;
                            font-family: Arial, sans-serif;
                        }
                        body{
                            background-color: #f1f1f1;
                            margin: 0;
                            padding: 0;
                        }
                        .container{
                            width: 90%;
                            max-width: 720px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #fff;
                            border-radius: 10px;
                            box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.2);
                        }
                        form{
                            display: flex;
                            flex-direction: column;
                        }
                        label{
                            margin-bottom: 5px;
                            font-weight: bold;
                        }
                        input{
                            height: 40px;
                            padding: 5px;
                            margin-bottom: 10px;
                            border: none;
                            border-radius: 5px;
                            font-size: 18px;
                            outline: none;
                        }
                        button{
                            height: 40px;
                            background-color: red;
                            color: #fff;
                            border: none;
                            border-radius: 5px;
                            font-size: 18px;
                            cursor: pointer;
                        }
                        .forgot-password{
                            margin-top: 10px;
                            text-align: center;
                        }
                        .forgot-password a{
                            color: red;
                            font-weight: bold;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Login Page</h1>
                        <form>
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" required>

                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required>

                            <button type="submit">Login</button>
                        </form>
                        <div class="forgot-password">
                            <a href="#">Forgot Password?</a>
                        </div>
                    </div>
                </body>
                </html>
        `}
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