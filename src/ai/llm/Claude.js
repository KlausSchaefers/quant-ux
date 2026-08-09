import LLM from "./LLM";

export default class Claude extends LLM {
  constructor(token, model = "gpt-4.1", embeddingModel = "text-embedding-3-small") {
    super();
    this.token = token;
    this.model = model;
    this.embeddingModel = embeddingModel;
  }

  /**
   * tools: provider-agnostic tool definitions (see LLM.runToolCalls doc), e.g.
   *   [{ name, description, parameters }]
   * Adapted here into Anthropic's shape:
   *   [{ name, description, input_schema }]
   * Returns the assistant text plus any requested tool calls:
   *   { content, toolCalls: [{ id, name, arguments }], usage, finish_reason }
   */
  async runToolCalls(messages, tools) {
    try {
      const systemPrompt = messages.find((m) => m.role === "system")?.content;
      const prompt = messages.find((m) => m.role === "user")?.content;

      if (!systemPrompt || !prompt) {
        return {
          error: "error-wrong prompt",
        };
      }

      const data = {
        model: this.model,
        max_tokens: 5000,
        temperature: 1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: this._toClaudeTools(tools),
      };

      const res = await this._post("https://api.anthropic.com/v1/messages", data);

      if (res.content) {
        const content = res.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("");

        const toolCalls = res.content
          .filter((block) => block.type === "tool_use")
          .map((block) => ({
            id: block.id,
            name: block.name,
            arguments: block.input,
          }));

        return {
          content: content,
          toolCalls: toolCalls,
          usage: res.usage,
          finish_reason: res.stop_reason,
        };
      }

      if (res.error) {
        if (res.error.type === "authentication_error") {
          return {
            error: "error-server-key",
          };
        }
        if (res.error.type === "rate_limit_error") {
          return {
            error: "error-insufficient_quota",
          };
        }
      }
    } catch (error) {
      console.error("Claude.runToolCalls error", error);
      return {
        error: "error-json",
      };
    }
    return {
      error: "error-no-idea",
    };
  }

  _toClaudeTools(tools = []) {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }));
  }

  async runPrompt(messages) {
    try {
      const systemPrompt = messages.find((m) => m.role === "system")?.content;
      const prompt = messages.find((m) => m.role === "user")?.content;

      if (!systemPrompt || !prompt) {
        return {
          error: "error-wrong prompt",
        };
      }

      const data = {
        model: this.model,
        max_tokens: 5000,
        temperature: 1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      };

      const res = await this._post("https://api.anthropic.com/v1/messages", data);

      if (res.content) {
        const textContent = res.content
          .filter((content) => content.type === "text")
          .map((content) => content.text)
          .join("");

        return {
          content: textContent,
          usage: res.usage,
          finish_reason: res.stop_reason,
        };
      }

      if (res.error) {
        if (res.error.type === "authentication_error") {
          return {
            error: "error-server-key",
          };
        }
        if (res.error.type === "rate_limit_error") {
          return {
            error: "error-insufficient_quota",
          };
        }
      }
    } catch (error) {
      console.error("Claude.runPrompt error", error);
      return {
        error: "error-json",
      };
    }
    return {
      error: "error-no-idea",
    };
  }

  _createDefaultHeader() {
    return new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": this.token,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    });
  }

  _post(url, data) {
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: "post",
        body: JSON.stringify(data),
        headers: this._createDefaultHeader(),
      })
        .then((res) => {
          res
            .json()
            .then((j) => {
              resolve(j);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
