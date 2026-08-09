import LLM from "./LLM";

export default class Gemini extends LLM {
  constructor(token) {
    super();
    this.token = token;
    this.modelDefault = 'gemini-3.5-flash-lite';
    this.modelHigh = 'gemini-3.5-flash';
  }

  getModel(llmLevel='high') {
    if (llmLevel === 'high') {
      return this.modelHigh;
    }
    return this.modelDefault;
  }

  async runPrompt(messages, llmLevel='high') {
    try {
      const systemPrompt = messages.find((m) => m.role === "system")?.content;
      const prompt = messages.find((m) => m.role === "user")?.content;

      if (!systemPrompt || !prompt) {
        return {
          error: "error-wrong prompt",
        };
      }

      const data = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      };

      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        this.getModel(llmLevel) +
        ":generateContent";

      const res = await this._post(url, data);

      const candidate = res.candidates?.[0];
      if (candidate) {
        const content = candidate.content?.parts
          ?.filter((part) => part.text)
          .map((part) => part.text)
          .join("");

        return {
          content: content,
          usage: res.usageMetadata,
          finish_reason: candidate.finishReason,
        };
      }

      if (res.error) {
        // An invalid key is reported as 400/INVALID_ARGUMENT with an
        // API_KEY_INVALID reason, not as 401/UNAUTHENTICATED.
        const isKeyError =
          res.error.status === "UNAUTHENTICATED" ||
          res.error.code === 401 ||
          res.error.code === 403 ||
          res.error.details?.some((d) => d.reason === "API_KEY_INVALID");
        if (isKeyError) {
          return {
            error: "error-server-key",
          };
        }
        if (res.error.status === "RESOURCE_EXHAUSTED" || res.error.code === 429) {
          return {
            error: "error-insufficient_quota",
          };
        }
      }
    } catch (err) {
      console.error("Gemini.runPrompt error", err);
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
      Accept: "application/json",
      "x-goog-api-key": this.token,
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
