import LLM from "./LLM";

export default class CachedLLM extends LLM {

  constructor(llm, prefix = "quxLLMCache_") {
    super()
    this.llm = llm;
    this.prefix = prefix;
  }

  async runPrompt(messages = [], llmLevel = 'high') {
    const key = this._createKey(messages, llmLevel);
    const cached = this._getFromCache(key);
    if (cached) {
      console.debug('CachedLLM.runPrompt() > cache hit', key);
      return cached;
    }

    const res = await this.llm.runPrompt(messages, llmLevel);
    if (!res.error) {
      this._saveToCache(key, res);
    }
    return res;
  }

  async runToolCalls(messages = [], tools = [], llmLevel = 'high') {
    const key = this._createKey({ messages, tools }, llmLevel);
    const cached = this._getFromCache(key);
    if (cached) {
      console.debug('CachedLLM.runToolCalls() > cache hit', key);
      return cached;
    }

    const res = await this.llm.runToolCalls(messages, tools, llmLevel);
    if (!res.error) {
      this._saveToCache(key, res);
    }
    return res;
  }

  parseJSON(content) {
    return this.llm.parseJSON(content);
  }

  parseHTML(content) {
    return this.llm.parseHTML(content);
  }

  static clearCache(prefix = "quxLLMCache_") {
    console.error('ChachedLLM.clearCache()')
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => localStorage.removeItem(key));
  }

  _createKey(messages, llmLevel) {
    const raw = JSON.stringify({ messages, llmLevel });
    return this.prefix + this._hash(raw);
  }

  _hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  _getFromCache(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('CachedLLM._getFromCache()', err);
    }
    return null;
  }

  _saveToCache(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('CachedLLM._saveToCache()', err);
    }
  }
}
