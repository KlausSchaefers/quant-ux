import LLM from "./LLM";

export default class OpenAI extends LLM {
  
  constructor(token) {
    super()
    this.token = token;
    this.modelDefault = 'gpt-5.6-luna';
    this.modelHigh = 'gpt-5.6-terra';
  }

  getModel(llmLevel='high') {
    if (llmLevel === 'high') {
      return this.modelHigh;
    }
    return this.modelDefault;
  }

  _getBaseUrl() {
    return "https://api.openai.com";
  }

  /**
   * tools: provider-agnostic tool definitions (see LLM.runToolCalls doc), e.g.
   *   [{ name, description, parameters }]
   * Adapted here into the Responses API's flat shape:
   *   [{ type: "function", name, description, parameters }]
   * Returns the assistant text plus any requested tool calls:
   *   { content, toolCalls: [{ id, callId, name, arguments }], usage, status }
   * `arguments` is parsed from the JSON string OpenAI returns.
   */
  async runToolCalls(messages, tools, llmLevel='high') {
    const data = {
      model: this.getModel(llmLevel),
      input: messages,
      tools: this._toOpenAITools(tools),
    };
    try {
      const res = await this._post(this._getBaseUrl() + "/v1/responses", data);

      if (res.output) {
        const content = res.output
          .filter((item) => item.type === "message")
          .flatMap((item) => item.content || [])
          .filter((part) => part.type === "output_text")
          .map((part) => part.text)
          .join("");

        const toolCalls = res.output
          .filter((item) => item.type === "function_call")
          .map((item) => {
            let args = item.arguments;
            try {
              args = JSON.parse(args);
            } catch (err) {
              console.error("OpenAI.runToolCalls() > could not parse arguments", err);
            }
            return {
              id: item.id,
              callId: item.call_id,
              name: item.name,
              arguments: args,
            };
          });

        return {
          content: content,
          toolCalls: toolCalls,
          usage: res.usage,
          status: res.status,
        };
      }
      if (res.error) {
        if (res.error.code === "invalid_api_key") {
          return {
            error: "error-server-key",
          };
        }
        if (res.error.code === "insufficient_quota") {
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

  async runPrompt(messages, llmLevel='high') {
    const data = {
      model: this.getModel(llmLevel),
      input: messages,
    };
    try {
      const res = await this._post(this._getBaseUrl() + "/v1/responses", data);

      if (res.output) {
        const content = res.output
          .filter((item) => item.type === "message")
          .flatMap((item) => item.content || [])
          .filter((part) => part.type === "output_text")
          .map((part) => part.text)
          .join("");

        return {
          content: content,
          usage: res.usage,
          status: res.status,
        };
      }
      if (res.error) {
        if (res.error.code === "invalid_api_key") {
          return {
            error: "error-server-key",
          };
        }
        if (res.error.code === "insufficient_quota") {
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
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
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
            console.error("OpenAI._post", res)
            reject(new Error("Could not post " + url));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
