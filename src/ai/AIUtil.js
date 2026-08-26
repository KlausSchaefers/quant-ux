import OpenAI from './llm/OpenAI.js';
import QuxOpenAI from './llm/QuxOpenAI.js';
import QuxOpenRouter from './llm/QuxOpenRouter.js';
import Claude from './llm/Claude.js';
import Gemini from './llm/Gemini.js';
import OpenRouterLLM from './llm/OpenRouterLLM.js';
import CachedLLM from './llm/CachedLLM.js';
import Logger from '../core/Logger.js';

export function getOptions() {
    const saved = localStorage.getItem('quxAISettings')
    if (saved) {
        const data = JSON.parse(saved)
        data.cssMode = getCSSMode()
        return data
    }
    return {}
}

export function mergeScreenInApp(app, result) {
    result.screens = Object.assign({}, result.screens, app.screens);
    result.widgets = Object.assign({}, result.widgets, app.widgets);
    result.groups = Object.assign({}, result.groups, app.groups);
    result.lines = Object.assign({}, result.lines, app.lines);
    return result;
}

export function tagSession(result, sessionID) {
    Object.values(result.screens).forEach(scrn => {
        scrn.aiID = sessionID
    })
}

export function layoutScreens(result) {
    const gap = 64;
    let x = 0;

    Object.values(result.screens).forEach(scrn => {
      const dx = x - scrn.x;
      const dy = -scrn.y;

      scrn.x += dx;
      scrn.y += dy;

      scrn.children.forEach(id => {
        const widget = result.widgets[id];
        if (widget) {
          widget.x += dx;
          widget.y += dy;
        }
      });

      x += scrn.w + gap;
    });

    return result;
  }

export function getAllCssModes() {
    return [
        { label: "Wireframe Minimal", value: "wireframe_minimal" },
        { label: "Wireframe", value: "wireframe" },
        { label: "Creative", value: "creative" },
        { label: "Use Styles", value: 'useStyles' }
    ]
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
    if (options.provider === 'quxOpenAI') {
        result = new QuxOpenAI()
    }

    if (options.provider === 'quxOpenRouter') {
        result = new QuxOpenRouter()
    }

    if (options.provider === 'openai') {
        result = new OpenAI(options.tokenOpenAI)
    }

    if (options.provider === 'anthropic') {
        result = new Claude(options.tokenAnthropic)
    }

    if (options.provider === 'gemini') {
        result =  new Gemini(options.tokenGemini)
    }

    if (options.provider === 'openRouter') {
        result = new OpenRouterLLM(options.tokenOpenRouter, options.modelOpenRouter)
    }

    if (useCache && result) {
        Logger.warn('AIUtil.getLLM() > use CachedLLM')
        result = new CachedLLM(result)
    }

    return result
}