export default class Tool {

  constructor(llm, model, options, progressCallback, domNode) {
    this.llm = llm;
    this.model = model;
    this.options = options;
    this.progressCallback = progressCallback; 
    this.domNode = domNode
    this.screenSize = model.screenSize
  }

 getUserMessages(messages) {
    return messages
      .filter((m) => m.role == "user")
      .map((m) => m.content)
      .join("\n\n");
  }

}