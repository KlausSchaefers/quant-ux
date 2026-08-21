import Logger from "../core/Logger";
import IntendTool from './tools/IntendTool'
import ScreenTool from './tools/ScreenTool'
import MutliScreenTool from './tools/MutliScreenTool'
import * as Util from './AIUtil'
export default class Agent {

  constructor(llm, context, options, html2QUX, progressCallback) {
    this.llm = llm;
    this.context = context;
    this.model = context.model
    this.memory = context.memory
    this.options = options;
    this.progressCallback = progressCallback; 
    this.html2QUX = html2QUX
    this.session = "ai" + new Date().getTime()
    
    // or move to the screen tool?
    if (options.cssMode === 'wireframe_minimal') {
        options.isRemoveNonLeafs = true
        options.isRemoveContainers = true
    }

    if (options.cssMode === 'creative' || options.cssMode === 'useStyles') {
        options.isUseImages = true
    }

    this.intendTool = new IntendTool(llm, context, options, progressCallback);
    this.screenTool = new ScreenTool(llm, context, options, progressCallback, html2QUX);
    this.mutliScreenTool = new MutliScreenTool(llm, context, options, progressCallback, this.screenTool)
  }



  async run(messages) {
    Logger.log(1, 'Agent.run() > messages: ', this.session,  messages)
    this.memory.set('aiID', this.session)
   
    const result = {
      changes: []
    }

    // 1) think about a good structure
    this.onProgress("status", " - Check intend...");

    const tools = await this.intendTool.invoke(messages)
    Logger.log(-1, 'Agent.run() > tools: ', tools.map(t => t.name).join(','))
    if (tools.length === 0) {
      this.onProgress("error", "I can't help you.");
      return result
    }

    const tool = tools[0]
    Logger.log(-1, 'Agent.run() > selectedTool: ', tool)


    if (tool.name === 'create_screen') {
      const {app, html} = await this.screenTool.invoke(messages)
      Util.tagSession(app, this.session)
      const layoutedScreens = Util.layoutScreens(app); 
      result.changes.push({
          type: 'addScreen',
          value: layoutedScreens,
          html: html
      })
    }

    this.onProgress("status", "Done!");

    // console.debug("run() > app ", app.name);

    return result
  }

  cancel() {
    Logger.warn('Agent.cancel() > enter')
  }


  mergeScreenInApp(app, result) {
    Object.assign(result.screens, app.screens);
    Object.assign(result.widgets, app.widgets);
    Object.assign(result.groups, app.groups);
    Object.assign(result.lines, app.lines);
    return result;
  }

  onProgress(type, value) {
    if (this.progressCallback) this.progressCallback(type, value);
  }

  getUserMessages(messages) {
    return messages
      .filter((m) => m.role == "user")
      .map((m) => m.content)
      .join("\n\n");
  }
}
