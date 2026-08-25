export default class LLM {

  /**
   * Provider-agnostic tool definition, passed to runToolCalls() as:
   *   [{ name, description, parameters }]
   * where "parameters" is a JSON Schema object (type: "object", properties, required).
   * Each LLM implementation adapts this shape to its own wire format
   * (e.g. OpenAI's Responses API, Anthropic's input_schema, Gemini's functionDeclarations).
   *
   * Returns: { content, toolCalls: [{ id, name, arguments }], usage, error }
   * "arguments" is already parsed into an object.
   */
  // eslint-disable-next-line no-unused-vars
  async runToolCalls(messages, tools, llmLevel='high') {
    throw new Error("Method 'runToolCalls' must be implemented.");
  }

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
    const match = content.match(/```(?:html)?\s*([\s\S]*?)```/i);
    if (match) {
      return match[1].trim();
    }
    return content.trim();
  }
}
