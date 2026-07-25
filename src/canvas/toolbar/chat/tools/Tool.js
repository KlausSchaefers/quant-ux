export default class Tool {

  constructor(llm, model, options, progressCallback, html2QUX) {
    this.llm = llm;
    this.model = model;
    this.options = options;
    this.progressCallback = progressCallback; 
    this.html2QUX = html2QUX
    this.screenSize = model.screenSize
  }

 getUserMessages(messages) {
    return messages
      .filter((m) => m.role == "user")
      .map((m) => m.content)
      .join("\n\n");
  }

}