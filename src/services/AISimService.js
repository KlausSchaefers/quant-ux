import Logger from '../common/Logger'
import * as Flat2Tree from '../core/responsive/Flat2Tree'
// import * as Quant2Flat from '../core/responsive/Quant2Flat'
// import * as ExportUtil from '../core/responsive/ExportUtil'
import Config from '../core/responsive/Config'
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

    onProgress (listener) {
        this.progressListener = listener
    }

    destroy() {
        delete this.progressListener
    }

    async run(task, persona, key, app, repeats, screenId) {
        this.logger.log(-5, 'run()', repeats, screenId)
        if (!screenId) {
            const startScreen = Object.values(app.screens).find(s => s?.props.start === true)
            if (startScreen) {
                screenId = startScreen.id
            } else {
                this.logger.error('run() > No start screen found')
            }
        }

        if (!screenId) {
            this.logger.error('run() > No screen')
            return
        }


        const conf = Config.getDefault()
        const treeModel = Flat2Tree.transform(app, conf)

        let result = []
        for (let i = 0; i < repeats; i++) {
            this.logger.log(-5, 'run()', 'start > ' + i)
            const temp = []
            temp.push({
                screen: screenId,
                widget: null,
                type: "SessionStart"
            })
            await this.runScreen(temp, task, persona, key, app, treeModel, screenId)
    
    
            let now = new Date().getTime()
            const sessionID = `S${i}_${now}`
            for (const event of temp) {
                event.session = sessionID
                event.time = now
                now += 1000
                event.isAI = true
            }

            result = result.concat(temp)

            if (this.progressListener) {
                this.progressListener({
                    events: result,
                    round: i
                })
            }
        }

        return result
    }

    async runScreen (result, task, persona, key, app, treeModel, screenId) {
   
        this.logger.log(-5, 'runScreen()', screenId)

        const language = `
        
         Please return the result in JSON format. Return an array of 
         objects. Each object should have the following properties:

         id: a unique identifier for the widget to be interacted with.
         type: The type of interaction. Possible values are "click" and "input". Inputs are for form elements.
         value: If the interaction was if type "input", the value that was entered. For a text field, it would be the text, for a checkbox a boolean value.

         the following is an example of a JSON object that would be returned:
        [
            {
                "id": "w10230",
                "type": "click"
                value: null
            },
            {
                "id": "w10233",
                "type": "input"
                value: "hello world"
            },
        ]

        `

        const widgets = this.convertAppToText(treeModel, screenId)
   
        const prompt =`


            You are using the ${app.name} app. 
            
            You have been given the following task:

            ${task}


            You can see the screen with the following elements on the screen, 
            listed from top to down.  Elements can be of type label, button, textbox,
            checkboxes, radio buttons, dropdowns, etc or container elements that
            have more elements inside. Elements in an container, often belong togther.
            The screen was converted to JSON that maintains the structure of the screen.

            ${widgets}

            Please interact with the screen as if you were a user. You can trigger
            events like clicking on an element or filling out a form. In general,
            you read from top to down and left to right. But you can also interact
            in any other order that makes sense to you.

            Return the result as JSON in the following format:

            ${language}

            Do not return any text, just the JSON.
        `


        const data = {
            'openAIModel': '/v1/chat/completions',
            'openAIToken': key,
            'openAIOrgID': 'Klaus',
            'openAIPayload': {
                "model": 'gpt-4o',
                "messages": [
                    {"role": "system", "content": persona},
                    {"role": "user", "content": prompt}
                ]
            }
        }

        const events = await this.runPrompt(data)
        result.push({
            screen: screenId,
            type: "ScreenLoaded"
        })
        const scrn = app.screens[screenId]
        for (const event of events) {
            const line = this.getClickTarget(app, event.id)
            const widget = app.widgets[event.id]
            if (widget) {   
                const pos = this.getPos(scrn, widget)

                if (event.type === 'input') {
                    const click = {
                        screen: screenId,
                        type: 'WidgetClick',
                        widget: event.id,
                        x: pos.x,
                        y: pos.y,
                        scrollTop: 0
                    }
                    result.push(click)

                    const change = {
                        screen: screenId,
                        type: 'WidgetChange',
                        widget: event.id,
                        value: event.value,
                        x: -1,
                        y: -1,
                        scrollTop: 0,
                        state: {
                            "type" : "text",
                            "value" : event.value
                        }
                    }
                    result.push(change)
                }

                if (event.type === 'click') {
                    const click = {
                        screen: screenId,
                        type: 'WidgetClick',
                        widget: event.id,
                        x: pos.x,
                        y: pos.y,
                        scrollTop: 0
                    }
                    result.push(click)
                }


                if (line && line.to) {
                    await this.runScreen(result, task, persona, key, app, treeModel, line.to)
                    return result
                }
            } else {
                this.logger.error('runScreen() > widget not found', event.id)
            }
        }
        return result
    }

    getPos(srcn, widget) {
        const pos = {
            x: widget.x - srcn.x + (widget.w * 0.2) + Math.round(widget.w * 0.6 * Math.random()),
            y: widget.y - srcn.y + (widget.h * 0.2) + Math.round(widget.h * 0.6 * Math.random())
        }

        return {
            x: Math.min(1, Math.round((pos.x / srcn.w) * 1000) / 1000 ),
            y: Math.min(1, Math.round((pos.y / srcn.h) * 1000) / 1000 )
        }
    }

    getClickTarget(model, widgetID) {
        const line = Object.values(model.lines).find(l => l.from === widgetID)
        return line
    }

   
    async runPrompt (data) {

        try {
            const start = Date.now()
            const res = await this._post('/ai/openai.json', data)
            const end = Date.now()
            this.logger.log(3, 'runPrompt() > API took ', end-start)

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

    convertAppToText (treeModel, screenId) {
        let result = ''
        const scrn = treeModel.screens.find(s => s.id === screenId)
        if (scrn) {
            result += this.convertBoxToJSON(scrn)
        }      
        return result
    }

    convertBoxToText (box) {
        this.logger.log(-5, "convertBoxToText", box.name)
        let result = ''
        if (box.children) {
            box.children.sort((a,b) => a.y - b.y)
            box.children.forEach(child => {                
                if (child.children.length > 0) {
                    console.debug(' + ', child.name, child.x, child?.props?.label)
                    result += `- A container element with the following ${box.children.length} child elements inside\n\n`
                    result += this.convertBoxToText(child)
                    result += `The container ends. \n\n`
                } else {
                    console.debug(' - ', child.name, child.type,  child.x, child?.props?.label)
                    if (child?.props?.label) {
                        result += `- A ${this.convertTypeToText(child.type)} with the label "${child?.props?.label}".`
                    } else {
                        result += `- A ${this.convertTypeToText(child.type)}.`
                    }
                    result +='\n\n'
                }
            })
        }
        return result
    }

    convertBoxToJSON (box, parent = {type: 'screen', children:[]}) {
        this.logger.log(5, "convertBoxToJSON", box.name)

        if (box.children) {
            box.children.sort((a,b) => a.y - b.y)
            box.children.forEach(child => {
                
                if (child.children.length > 0) {
                    const container = {
                        type: 'container',
                        children: []
                    }
                    parent.children.push(container)
                    this.convertBoxToJSON(child, container)
                } else {
                    const widget = {
                        id: child.id,
                        type: child.type,
                        label: child?.props?.label
                    }
                    parent.children.push(widget)
                }
            })
        }


        return JSON.stringify(parent, undefined, 2)
    }

    convertTypeToText(type) {
        if (type === 'TextBox') {
            return "TextField"
        }
        return type
    }
  

    extractEvents (content) {
        console.debug('extractEvents', content)
        try {
            content = content.split('\n').slice(1, -1).join('\n')
            const json = JSON.parse(content)
            return json
        } catch (e) {
            console.debug('extractEvents', content)
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