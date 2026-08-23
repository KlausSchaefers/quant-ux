import LLM from "./LLM";

export default class OpenRouterLLM extends LLM {

  constructor(token, model = 'deepseek/deepseek-v4-flash') {
    super()
    this.token = token;
    this.model = model;
  }

  getModel() {
    return this.model;
  }

  _getBaseUrl() {
    return "https://openrouter.ai/api/v1";
  }

  /**
   * tools: provider-agnostic tool definitions (see LLM.runToolCalls doc), e.g.
   *   [{ name, description, parameters }]
   * Adapted here into the OpenAI-compatible Chat Completions shape:
   *   [{ type: "function", function: { name, description, parameters } }]
   * Returns the assistant text plus any requested tool calls:
   *   { content, toolCalls: [{ id, name, arguments }], usage, finish_reason }
   * `arguments` is parsed from the JSON string OpenRouter returns.
   */
  async runToolCalls(messages, tools) {
    const data = {
      model: this.getModel(),
      messages: messages,
      tools: this._toOpenAITools(tools),
    };
    try {
      const res = await this._post(this._getBaseUrl() + "/chat/completions", data);

      if (res.choices && res.choices.length > 0) {
        const choice = res.choices[0];
        const content = choice.message?.content || "";

        const toolCalls = (choice.message?.tool_calls || []).map((call) => {
          let args = call.function?.arguments;
          try {
            args = JSON.parse(args);
          } catch (err) {
            console.error("OpenRouterLLM.runToolCalls() > could not parse arguments", err);
          }
          return {
            id: call.id,
            name: call.function?.name,
            arguments: args,
          };
        });

        return {
          content: content,
          toolCalls: toolCalls,
          usage: res.usage,
          finish_reason: choice.finish_reason,
        };
      }
      if (res.error) {
        if (res.error.code === "invalid_api_key" || res.error.code === 401) {
          return {
            error: "error-server-key",
          };
        }
        if (res.error.code === "insufficient_quota" || res.error.code === 429) {
          return {
            error: "error-insufficient_quota",
          };
        }
      }
    } catch (err) {
      return {
        error: "error-server",
      };
    }
    return {
      error: "error-no-idea",
    };
  }

  async runPrompt(messages) {
    const data = {
      model: this.getModel(),
      messages: messages,
    };
    try {
      const res = await this._post(this._getBaseUrl() + "/chat/completions", data);

      if (res.choices && res.choices.length > 0) {
        const choice = res.choices[0];
        return {
          content: choice.message?.content,
          usage: res.usage,
          finish_reason: choice.finish_reason,
        };
      }
      if (res.error) {
        if (res.error.code === "invalid_api_key" || res.error.code === 401) {
          return {
            error: "error-server-key",
          };
        }
        if (res.error.code === "insufficient_quota" || res.error.code === 429) {
          return {
            error: "error-insufficient_quota",
          };
        }
      }
    } catch (err) {
      return {
        error: "error-server",
      };
    }
    return {
      error: "error-no-idea",
    };
  }

  _toOpenAITools(tools = []) {
    return tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  _createDefaultHeader() {
    return new Headers({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + this.token,
    });
  }

  _post(url, data) {

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: "post",
        credentials: "same-origin",
        body: JSON.stringify(data),
        headers: this._createDefaultHeader(),
      })
        .then((res) => {
          if (res.status === 200) {
            res.json().then((j) => {
              resolve(j);
            });
          } else {
            console.error("OpenRouterLLM._post", res)
            reject(new Error("Could not post " + url));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
