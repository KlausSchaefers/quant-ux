export default class LLM {

  // eslint-disable-next-line no-unused-vars
  async runPrompt(messages = [], llmLevel='high') {
    throw new Error("Method 'runPrompt' must be implemented.");
  }

  async runHTMLPrompt(messages, llmLevel='high') {
    let res = await this.runPrompt(messages, llmLevel)
    if (res.error) {
      return {
        error: res.error,
      }
    }
    try {
      const content = res.content;
      const html = this.parseHTML(content);
      return {
        html: html
      }
    } catch (err) {
      console.error('LLM.runHTMLPrompt() > ', err.message)
      return {
        error: "error-json"
      }
    }
  }

  async runJSONPrompt(messages, llmLevel='high') {
    let res = await this.runPrompt(messages, llmLevel)
    if (res.error) {
      return {
        error: res.error,
      }
    }
    try {
      const content = res.content;
      const json = this.parseJSON(content);
      return {
        json: json
      }
    } catch (err) {
      console.error('LLM.runJSONPrompt() > ', err.message)
      return {
        error: "error-json"
      }
    }
  }

  parseJSON(content) {
    if (content.startsWith("```json")) {
      content = content.substring(8, content.length - 3).trim();
    }
    if (content.startsWith("```")) {
      content = content.substring(3, content.length - 3).trim();
    }
    return JSON.parse(content);
  }

  parseHTML(content) {
    if (content.startsWith("```html")) {
      content = content.substring(8, content.length - 3).trim();
    }
    if (content.startsWith("```")) {
      content = content.substring(3, content.length - 3).trim();
    }
    return content;
  }
}
