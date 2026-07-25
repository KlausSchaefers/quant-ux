import Tool from "./Tool";
export default class Screen extends Tool {
  constructor(llm, model, options, progressCallback, html2QUX) {
    super(llm, model, options, progressCallback, html2QUX);
  }

  async invoke(messages) {
    const message = this.getUserMessages(messages);

    const prompt = `

            ${this.promptHTML()}

            ${this.promptScreenSize()}

            Please generate a screen:

            ${message}

            ${this.promptRules()}
            
            Return the result as HTML. 
        `;

    const aiMessages = [
      {
        role: "system",
        content: this.promptSystem(),
      },
      { 
          role: "user", 
          content: prompt 
      },
    ];


    this.progressCallback("Generate Screen...")
    const res = await this.llm.runHTMLPrompt(aiMessages);
    console.debug("RESULT: ", res);

    if (res.error) {
      return {
        error: res.error,
      };
    }
    return {
      html: res.html,
      useHTML: true,
      prompt: prompt,
      usage: res.usage,
    };
  }

  promptHTML() {
    return `
          Return HTML markup with inline css or complete CSS classes defined in the head. A valid result would look like

          \`\`\`html
              <html>...
              </html>
          \`\`\`

      `;
  }

  promptScreenSize() {
    if (this.screenSize.w < 500) {
      return `Please design for a mobile app. The maximum screen size is ${this.screenSize.w}px. 
            This means most of the content should be stacked below each other. You can 
            still use horizontal alignment, but don't put more then 3 elements in one row.`;
    }
    return `
            Plese design a desktop application with a screensize of ${this.screenSize.w}px. You should make
            use of the width and not make the HTML any wider. 
        `;
  }

  promptRules() {
    return `
            Important! Please follow this additonal rules when designing the screen:

            - Do not place any "Section" in another "Section". Section should be only used under the "Screen" element.
        `;
  }

  promptSystem() {
    return `
            You are design GPT. You are really good at designing websites, app and all other kind of user interfaces. You are very create 
            and create beautiful designs and code them in HTML.
        `;
  }
}
