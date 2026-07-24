import LLM from "./LLM";

export default class OpenAI extends LLM {
  
  constructor(token, model = "gpt-4.1") {
    super()
    this.token = token;
    this.model = model;
  }


  async runPrompt(messages) {
    const data = {
        model: this.model,
        messages: messages      
    };
    try {
      const res = await this._post("https://api.openai.com/v1/chat/completions", data);

      if (res.choices && res.choices.length > 0) {
        const choice = res.choices[0];
        const content = choice?.message?.content;
        return {
          content: content,
          usage: res.usage,
          finish_reason: choice.finish_reason,
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
