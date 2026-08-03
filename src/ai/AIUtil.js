import OpenAI from './llm/OpenAI.js';
import Claude from './llm/Claude.js';
import Gemini from './llm/Gemini.js';
import CachedLLM from './llm/CachedLLM.js';
import Logger from '../core/Logger.js';

export function getOptions() {
    const saved = localStorage.getItem('quxAISettings')
    if (saved) {
        const data = JSON.parse(saved)
        data.cssMode = getCSSMode()
        return data
    }
}

export function setCSSMode(cssMode){
    localStorage.setItem('quxAICssMode', cssMode)
}

export function getCSSMode(){
    const cssMode = localStorage.getItem('quxAICssMode')
    if (cssMode) {
        return cssMode    
    }
    return 'wireframe'
}

export function getLLM(options, useCache=false) {
    Logger.log(1, 'AIUtil.getLLM() > ', options.provider, useCache)
    let result;
    if (options.provider === 'openai') {
        result = new OpenAI(options.token)
    }

    if (options.provider === 'anthropic') {
        result = new Claude(options.token, this.selectedModel)
    }

    if (options.provider === 'gemini') {
        result =  new Gemini(options.token)
    }

    if (useCache && result) {
        Logger.warn('AIUtil.getLLM() > use CachedLLM')
        result = new CachedLLM(result)
    }

    return result
}