import Logger from "../core/Logger";
import StructureTool from './tools/StructureTool'
import ScreenTool from './tools/ScreenTool'
export default class Agent {

  constructor(llm, model, options, html2QUX, progressCallback) {
    this.llm = llm;
    this.model = model;
    this.options = options;
    this.progressCallback = progressCallback; 
    this.html2QUX = html2QUX

    this.structureTool = new StructureTool(llm, model, options, progressCallback);
    this.screenTool = new ScreenTool(llm, model, options, progressCallback, html2QUX);
  }



  async run(messages) {
    Logger.log(-1, 'Agent.run()', messages)
    const result = {
      name: "",
      screenSize: this.model.screenSize,
      screens: {},
      widgets: {},
      groups:{},
      lines: {},
      _html: {}
    };

    // 1) think about a good structure
    this.onProgress(" - Plan main structure...");

    const {app, html} = await this.screenTool.invoke(messages)
    result._html[Object.values(app.screens)[0]?.id] = html

    this.mergeScreenInApp(app, result)
    this.layoutScreens(result)

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
    const layoutedScreens = this.layoutScreens(result); 
    return {
      changes: [{
        type: 'add',
        value: layoutedScreens
      }]
    } 
  }

  cancel() {
    Logger.warn('Agent.cancel() > enter')
  }


  layoutScreens(result) {
    const gap = 64;
    let x = 0;

    Object.values(result.screens).forEach(scrn => {
      const dx = x - scrn.x;
      const dy = -scrn.y;

      scrn.x += dx;
      scrn.y += dy;

      scrn.children.forEach(id => {
        const widget = result.widgets[id];
        if (widget) {
          widget.x += dx;
          widget.y += dy;
        }
      });

      x += scrn.w + gap;
    });

    return result;
  }

  mergeScreenInApp(app, result) {
    Object.assign(result.screens, app.screens);
    Object.assign(result.widgets, app.widgets);
    Object.assign(result.groups, app.groups);
    Object.assign(result.lines, app.lines);
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
