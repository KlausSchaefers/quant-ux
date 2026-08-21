export default class Tool {

  constructor(llm, context, options, progressCallback, html2QUX) {
    this.llm = llm;
    this.context = context;
    this.model = context.model
    this.options = options;
    this.progressCallback = progressCallback;
    this.html2QUX = html2QUX
    this.screenSize = this.model.screenSize
  }

  onProgress(type, value) {
    if (this.progressCallback) {
      this.progressCallback(type, value)
    }
  }

  getUserMessages(messages) {
    return messages
      .filter((m) => m.role == "user")
      .map((m) => m.content)
      .join("\n\n");
  }

}