import OpenRouterLLM from "./OpenRouterLLM";
import Services from "../../services/Services";

/**
 * Uses the OpenRouter Chat Completions API, but proxied through our own backend
 * (/rest/ai-proxy), authenticated with the quant-ux user token instead
 * of a user-supplied OpenRouter API key.
 */
export default class QuxOpenRouter extends OpenRouterLLM {

  constructor(model) {
    super(null, model);
  }

  _createDefaultHeader(url) {
    return new Headers({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + Services.getUserService().getToken(),
      "x-qux-url": url,
    });
  }

  _post(url, data) {
    return new Promise((resolve, reject) => {
      fetch("/rest/ai-proxy", {
        method: "post",
        credentials: "same-origin",
        body: JSON.stringify(data),
        headers: this._createDefaultHeader(url),
      })
        .then((res) => {
          if (res.status === 200) {
            res.json().then((j) => {
              resolve(j);
            });
          } else {
            res.json()
              .then((body) => {
                const err = new Error(body.error || body.message || body.type || ("Could not post " + url));
                err.body = body;
                reject(err);
              })
              .catch(() => {
                console.error("QuxOpenRouter._post", res);
                reject(new Error("Could not post " + url));
              });
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
