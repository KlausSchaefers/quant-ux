import Tool from "./Tool"

export default class StructureTool extends Tool {

  constructor(llm, model, options, progressCallback) {
    super(llm, model, options, progressCallback)
  }


  async run(messages) {

    const message = this.getUserMessages(messages);
    const prompt = `

          ${this.prompt.jsonFormatStructure()}
    
          Please generate an app:

          ${message}

          Do not forget to give the app a name property.
          Return the result as JSON in the defined language. Do not include any additional text. 
    `;

    const aiMessages = [
      {
        role: "system",
        content: this.prompt.systemStructure(),
      },
      { role: "user", content: prompt },
    ];
    const res = await this.llm.runJSONPrompt(aiMessages);
    if (res.error) {
      return {
        error: res.error,
      };
    }
    return {
      app: res.json,
      prompt: prompt,
      usage: res.usage,
    };
  }

}