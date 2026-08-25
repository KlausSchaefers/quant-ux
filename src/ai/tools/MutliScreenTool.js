
    import Logger from "../../core/Logger";
    import Tool from "./Tool";
    import QSS from "../../core/qss/QSS";
    import Wireframer from "./Wireframer";
    import ModelUtil from "../../core/ModelUtil";
    import QUX2CSS from "../QUX2CSS";
    export default class MutliScreenTool extends Tool {
    
      constructor(llm, context, options, progressCallback, screenTool) {
        super(llm, context, options, progressCallback);
        this.screenTool = screenTool
        Logger.log(2, 'MutliScreenTool.constructor() ', screenTool)
      }
    
      async invoke(messages) {
      
        // const allScreenResults = {
        //   name: "",
        //   screenSize: this.model.screenSize,
        //   screens: {},
        //   widgets: {},
        //   groups:{},
        //   lines: {},
        //   _html: {}
        // };

      }
    
    
      promptSystem() {
        return `
                You are design GPT. You are really good at designing websites, app and all other kind of user interfaces. You are very create 
                and create beautiful designs and code them in HTML.
            `;
      }
    }
    