import OpenAI from './llm/OpenAI.js';
import Claude from './llm/Claude.js';
import Gemini from './llm/Gemini.js';
import CachedLLM from './llm/CachedLLM.js';
import Logger from '../core/Logger.js';

export function getOptions() {
    const saved = localStorage.getItem('quxAISettings')
    if (saved) {
        const data = JSON.parse(saved)
        data.cssMode = this.cssMode
        return data
    }
}

export function getLLM(options, useCache=false) {

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