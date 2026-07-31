import LLM from "./LLM";
import { GoogleGenAI } from "@google/genai";

export default class Gemini extends LLM {
  constructor(token, model = "gemini-2.5-flash", embeddingModel = "text-embedding-3-small") {
    super();
    this.token = token;
    this.model = model;
    this.embeddingModel = embeddingModel;
    this.ai = new GoogleGenAI({ apiKey: this.token });
  }

  async runPrompt(messages) {
    if (!this.ai) {
      return {
        error: "no-ai-instance",
      };
    }

    try {
      const systemPrompt = messages.find((m) => m.role === "system")?.content;
      const prompt = messages.find((m) => m.role === "user")?.content;

      if (!systemPrompt || !prompt) {
        return {
          error: "error-wrong prompt",
        };
      }

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: {
            // thinkingBudget: 0, // Disables thinking
          },
        },
      });
      return {
        content: response.text,
        usage: 0,
        finish_reason: "",
      };
    } catch (err) {
      console.error("Gemini.runPrompt error", err);
      return {
        error: "error-server",
      };
    }
  }

  _createDefaultHeader() {
    return new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + this.token,
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
            console.error("OpenAI._post", res);
            reject(new Error("Could not post " + url));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
