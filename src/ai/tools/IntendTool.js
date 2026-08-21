import Tool from "./Tool";
export default class IntendTool extends Tool {
  
  constructor(llm, context, options, progressCallback, html2QUX) {
    super(llm, context, options, progressCallback, html2QUX);
  }

  async invoke(messages) {
    const message = this.getUserMessages(messages);

    // provider-agnostic tool definition (see LLM.runToolCalls doc)
    const tools = [
      this.createTool(
        "create_screen",
        `
          Create a new screen based on the users description.
        `,
        {
          messages: { type: "string", description: "The user's description of the screen to create." },
        }
      ),
      this.createTool(
        "ask_user",
        `
          Ask the user a clarifying question when the request is unclear or
          missing information needed to proceed. Use this tool when you don't
          think any other tool would be suitable.
        `,
        {
          question: { type: "string", description: "The question to ask the user." },
        }
      ),
    ];

    const prompt = `
        You are an design agent. Please select the right tool 
        for the given user request. If you think no tool
        fits, return no result

        ${message}
    `;

    const aiMessages = [
      {
        role: "system",
        content: this.promptSystem(),
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const res = await this.llm.runToolCalls(aiMessages, tools);
    if (res.error) {
      throw new Error(res.error)
    }

    return res.toolCalls
  }

  createTool(name, description, properties) {
    return {
      name: name,
      description: description.trim(),
      parameters: {
        type: "object",
        properties: properties,
        required: Object.keys(properties),
      },
    };
  }

  promptSystem() {
    return `
        You are an design agent. Please select the right tool 
        for the given user request. If you think no tool
        fits, return no result.
    `;
  }
}
