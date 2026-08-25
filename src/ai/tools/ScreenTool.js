import Logger from "../../core/Logger";
import Tool from "./Tool";
import QSS from "../../core/qss/QSS";
import Wireframer from "./Wireframer";
import ModelUtil from "../../core/ModelUtil";
import QUX2CSS from "../QUX2CSS";
export default class ScreenTool extends Tool {

  constructor(llm, context, options, progressCallback, html2QUX) {
    super(llm, context, options, progressCallback, html2QUX);
  }

  async invoke(messages) {
    const message = this.getUserMessages(messages);

    const prompt = `

            ${this.promptHTML()}

            ${this.promptScreenSize()}

            ${this.promptDesignSystem()}

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


    this.onProgress("status", "Generate Screen...")
    const res = await this.llm.runHTMLPrompt(aiMessages);

    if (res.error) {
      throw new Error(res.error)
    }

    const html = res.html
    const app = await this.html2QUX.run(
      html, 
      this.screenSize.w, 
      this.screenSize.h, 
      this.options
    )

   
    const styledApp = this.applyStyle(app)

    return {
      html: html,
      app: styledApp,
      prompt: prompt,
      usage: res.usage,
    };
  }

  applyStyle (app) {
    if (this.options.cssMode !== 'wireframe' && this.options.cssMode !== 'wireframe_minimal') {
      return app
    }

    Logger.log(1, "ScreenTool.applyStyle() > enter", app)

    const theme = QSS.getTheme('wireframe')
    const wireframer = new Wireframer(theme)
    return wireframer.apply(app)
  }

  promptDesignSystem () {
    Logger.log(1, 'ScreenTool.promptDesignSystem() > enter', this.options.cssMode)
    if (this.options.cssMode === 'useStyles') {
      const qux2CSS = new QUX2CSS()
      const css = qux2CSS.toCSS(this.model, true)
      return `
        Please use the following css classes if possible.
        ${css}
        If you think you need a new style, reuse the colors,
        and dimensions.
      `.trim()
    }
    return ''
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
    // TODO: 
    // for letter-spacing and line-height use relative values like 1.4, not pixel or em values
    //
    const fonts = ModelUtil.getFontFamilies()
        .filter(f => f.value)
        .map(f => `'${f.value}'`)
        .join(',')
    //console.debug(fonts)
    return `
            Important! Please follow this additonal rules when designing the screen:
            - use always box-sizing: border-box;
            - Do not use hidden form elements
            - Do not use vendor prefixes for CSS styles
            - do not rotate elements. Do not use css transform:rotate().
            - Do not place any "Section" in another "Section". Section should be only used under the "Screen" element.
            - Use one of these fonts: ${fonts}    
        `;
  }

  promptSystem() {
    return `
            You are design GPT. You are really good at designing websites, app and all other kind of user interfaces. You are very create 
            and create beautiful designs and code them in HTML.
        `;
  }
}
