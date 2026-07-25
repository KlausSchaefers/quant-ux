import LLM from "./LLM";

export default class Ollama extends LLM {
  
  constructor(server, token, model = "gemma3:4b", username = 'apiuser') {
    super()
    this.server = server
    this.token = token;
    this.model = model;
    this.username = username;
  }


  async runPrompt(messages) {
    const prompt  = messages[0].content
    const data = {
        model: this.model,
        prompt: prompt,
        stream: false
    };
    try {
      const res = await this._post(`${this.server}`, data);
      console.debug('Ollama', res)
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
    const auth = this.username
      ? "Basic " + btoa(`${this.username}:${this.token}`)
      : "Bearer " + this.token;
    return new Headers({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": auth,
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


