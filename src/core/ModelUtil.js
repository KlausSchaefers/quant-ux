import lang from 'dojo/_base/lang'
import Logger from 'common/Logger'
import CoreUtil from 'core/CoreUtil'

class ModelUtil {

    constructor() {
      this.logger = new Logger("ModelUtil");
    }


    createScalledModel(model, zoom) {
      this.logger.log(3, "Core.createScalledModel", "enter > " + zoom + " > ");


      var zoomedModel = lang.clone(model);
      zoomedModel.isZoomed = true;

      CoreUtil.getZoomedBox(zoomedModel.screenSize, zoom, zoom);

      for (let id in zoomedModel.widgets) {
        CoreUtil.getZoomedBox(zoomedModel.widgets[id], zoom, zoom);
      }

      for (let id in zoomedModel.screens) {
          var zoomedScreen = CoreUtil.getZoomedBox(
              zoomedModel.screens[id],
              zoom,
              zoom
          );

          /**
           * This has a tiny tiny bug that makes copy of the same screen jump as x and y and rounded()
           * To fix this, we should take the relative and x and y in the parent and round that...
           *
           * scalledWidget.x = scalledScreen.x + (orgWidget.x - orgScreen.x)*zoomX
           *
           * As an alternative we could stop using Math.round() ...
           */
          for (let i = 0; i < zoomedScreen.children.length; i++) {
              let wid = zoomedScreen.children[i];
              let zoomWidget = zoomedModel.widgets[wid];
              let orgWidget = model.widgets[wid];
              if (orgWidget) {
                  /**
                   * When we copy a screen we might not have the org widget yet
                   */
                  var orgScreen = model.screens[zoomedScreen.id];
                  var difX = CoreUtil.getZoomed(orgWidget.x - orgScreen.x, zoom);
                  var difY = CoreUtil.getZoomed(orgWidget.y - orgScreen.y, zoom);
                  if (orgWidget.parentWidget) {
                      if (zoomWidget.x >= 0) {
                          zoomWidget.x = zoomedScreen.x + difX;
                      }
                      if (zoomWidget.y >= 0) {
                          zoomWidget.y = zoomedScreen.y + difY;
                      }
                  } else {
                      zoomWidget.x = zoomedScreen.x + difX;
                      zoomWidget.y = zoomedScreen.y + difY;
                  }
              }
          }
      }

      for (let id in zoomedModel.lines) {
          let line = zoomedModel.lines[id];
          for (let i = 0; i < line.points.length; i++) {
            CoreUtil.getZoomedBox(line.points[i], zoom, zoom);
          }
      }


      return zoomedModel;
  }
}

export default new ModelUtil()