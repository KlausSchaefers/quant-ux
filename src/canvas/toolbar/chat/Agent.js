import Logger from "../../../core/Logger";
import StructureTool from './tools/StructureTool'
import ScreenTool from './tools/ScreenTool'
export default class Agent {

  constructor(llm, model, options, progressCallback, domNode) {
    this.llm = llm;
    this.model = model;
    this.options = options;
    this.progressCallback = progressCallback; 
    this.domNode = domNode

    this.structureTool = new StructureTool(llm, model, options, progressCallback, domNode);
    this.screenTool = new ScreenTool(llm, model, options, progressCallback, domNode);
  }



  async run(messages) {
    Logger.log(-1, 'Agent.run()', messages)
    const result = {
      name: "",
      screenSize: this.model.screenSize,
      screens: [],
      widgets: []
    };

    // 1) think about a good structure
    this.onProgress(" - Plan main structure...");

    const html = await this.screenTool.invoke(messages)
    console.debug(html)
    // const structure = await this.structureTool.run(messages);
    // if (structure.error) {
    //   return structure;
    // }

    // Logger.log(-1, "Agent.run() > structure ", structure);

    // result.raw.structure = structure.app;
    // const app = structure.app;
    // result.name = app.name;
    // result.raw.name = app.name;

    // console.debug("run() > app ", app.name);

    // // 2) create the screens
    // for (let section of app.sections) {
    //   for (let s of section.screens) {
    //     this.onProgress("- Create screen __" + s.name + "__");
    //     const scrn = await this.screenTool.run(messages, s, section, app);
    //     if (scrn.raw) {
    //       scrn.raw.name = s.name;
    //       result.screens.push(structuredClone(scrn.raw));
    //       result.raw.screens.push(scrn.raw);
    //     } else {
    //       console.warn("run() > Could not create screen");
    //     }
    //   }
    // }

    // //3) plan design system
    // this.onProgress(" - Plan design system...");
    // const dsl = await this.dslTool.run(messages, currentModel);
    // result.dsl = dsl;
    // result.raw.dsl = dsl;

    // // 4) Set basic props and design system
    // this.pipeline.convert(result);

    // console.debug("run() > app ", app.name);
    return result;
  }

  onProgress(message) {
    if (this.progressCallback) this.progressCallback(message);
  }

  getUserMessages(messages) {
    return messages
      .filter((m) => m.role == "user")
      .map((m) => m.content)
      .join("\n\n");
  }
}
