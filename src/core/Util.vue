
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import css from "dojo/css";
import win from "dojo/_base/win";
import DomBuilder from "common/DomBuilder";
import Layout from "core/Layout";
import ModelGeom from 'core/ModelGeom'
import ModelResizer from 'core/ModelResizer'
import ModelUtil from 'core/ModelUtil'
import PerformanceMonitor from 'core/PerformanceMonitor'
import * as DistributeUtil from 'core/DistributionUtil'

import * as UIUtil from '../util/UIUtil'
var Ring = {};
var ProgressBar = {};
export default {
  name: "Util",
  mixins: [Layout, DojoWidget],
  data: function() {
    return {
      eventLabels: {
        WidgetClick: "Click",
        ScreenLoaded: "View",
        ScreenClick: "Click",
        WidgetChange: "Change",
        ScreenScroll: "Scroll",
        OverlayLoaded: "View Overlay",
        OverlayRemoved: "Removed Overlay",
        ValidationError: "Widget ValiationError",
        ValidationErrorLine: "Form Validation Error",
        ValidationOK: "Validation OK",
        ScreenGesture: "Gesture",
        WidgetGesture: "Gesture"
      },
      gestureLabels: {
        swipeLeft: "Swipe Left",
        swipeRight: "Swipe Right",
        swipeUp: "Swipe Up",
        swipeDown: "Swipe Down"
      }
    };
  },
  components: {},
  methods: {

    getIcons () {
      return this._matcIcons;
    },

    fixGestures(events) {
      events.sort(function(a, b) {
        return a.time - b.time;
      });
      var device = null;
      var error = 0;
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.type == "SessionStart") {
          device = event.device;
        }

        if (event.type == "ScreenGesture" && event.gesture) {
          if (event.gesture.start && event.gesture.start.x > 1) {
            if (device) {
              event.gesture.start.x = Math.min(
                0.99,
                event.gesture.start.x / device.w
              );
              event.gesture.start.y = Math.min(
                0.99,
                event.gesture.start.y / device.h
              );
              error++;
            }
          }
          if (event.gesture.end && event.gesture.end.x > 1) {
            if (device) {
              event.gesture.end.x = Math.min(
                0.99,
                event.gesture.end.x / device.w
              );
              event.gesture.end.y = Math.min(
                0.99,
                event.gesture.end.y / device.h
              );
              error++;
            }
          }
          if (event.gesture.start) {
            event.x = event.gesture.start.x;
            event.y = event.gesture.start.y;
          }
        }
        if (event.x > 1 || event.y > 1) {
          console.warn("fixGestures() > exit. No device, could not fix! ");
        }
      }
      if (error) {
        console.debug("fixGestures() > exit. Fixed Errors: ", error);
      }
    },

    /**********************************************************************
     * Distribute Tool
     **********************************************************************/
    _distributedPositions (type, ids, boundingBox) {
        return DistributeUtil.distributedPositions(this.model, type, ids, boundingBox)
    },


    /**********************************************************************
     * Clone Tool
     **********************************************************************/
    getClones(ids, target) {
      var result = [];
      var previews = [];

      // 1) get bounding box
      var boudingBox = this.getBoundingBox(ids);

      var xFactor = 1;
      if (boudingBox.x > target.x) {
        xFactor = -1;
      }

      var yFactor = 1;
      if (boudingBox.y > target.y) {
        yFactor = -1;
      }

      var xCount = Math.floor(target.w / boudingBox.w);
      var yCount = Math.floor(target.h / boudingBox.h);
      var xSpace = Math.round(
        (target.w - xCount * boudingBox.w) / Math.max(1, xCount - 1)
      );
      var ySpace = Math.round(
        (target.h - yCount * boudingBox.h) / Math.max(1, yCount - 1)
      );
      //console.debug("getClones > x: ", xCount,xSpace, " y:", yCount, ySpace, " >> bb: ", boudingBox.w, boudingBox.h, boudingBox.y)

      var offSets = {};
      for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        var box = this.getBoxById(id);
        offSets[id] = {
          x: box.x - boudingBox.x,
          y: box.y - boudingBox.y,
          box: box
        };
      }

      // now create grid but not at 0,0
      var count = 0;
      for (let x = 0; x < xCount; x++) {
        for (let y = 0; y < yCount; y++) {
          if (x != 0 || y != 0) {
            let id;
            for (let i = 0; i < ids.length; i++) {
              id = ids[i];
              var offset = offSets[id];
              //console.debug(id,offset.x, offset.y , offset.box.h + ySpace + offset.y)
              var clone = {
                w: boudingBox.w,
                h: boudingBox.h,
                x: boudingBox.x + (x * (boudingBox.w + xSpace) + offset.x) * xFactor,
                y: boudingBox.y + (y * (boudingBox.h + ySpace) + offset.y) * yFactor,
                z: offset.box.z,
                group: count,
                cloneOff: id
              };
              result.push(clone);
            }
            /**
             * FIXME: Should this be in the loop?
             */
            var preview = {
              w: boudingBox.w,
              h: boudingBox.h,
              x: boudingBox.x + x * (boudingBox.w + xSpace) * xFactor,
              y: boudingBox.y + y * (boudingBox.h + ySpace) * yFactor,
              z: 0,
              cloneOff: id
            };
            previews.push(preview);
            count++;
          }
        }
      }
      return {
        previews: previews,
        clones: result
      };
    },

    /**********************************************************************
     * Bounding Box
     **********************************************************************/


    /**
     * Gets the new position for a group child
     */
    _getGroupChildResizePosition(widget, oldGroup, newGroup, dif) {
      console.warn("DEPRECATED: _getGroupChildResizePosition()")
      return ModelResizer.getGroupChildResizePosition(widget, oldGroup, newGroup, dif)
    },

    getObjectFromArray (list, key) {
      console.error('Util.vue .getObjectFromArray() > DEPRECATED!')
      return ModelUtil.getObjectFromArray(list, key)
    },


    getWidgetsByDistanceAndType(widget, types) {
      var result = [];

      if (this.model) {
        let screen = this.getParentScreen(widget);
        let children = screen.children;

        for (let i = 0; i < children.length; i++) {
          let widgetID = children[i];

          if (widgetID != widget.id) {
            let childWidget = this.model.widgets[widgetID];
            var type = childWidget.type;
            if (types.indexOf(type) >= 0) {
              result.push({
                d: 0,
                y: childWidget.y,
                w: childWidget
              });
            }
          }
        }
        result.sort(function(a, b) {
          return a.y - b.y;
        });
      }

      return result;
    },

    getObjectLength (o) {
      if (o) {
        return Object.keys(o).length;
      } else {
        return 0;
      }
    },

    getEventStateLabel (state) {
      if (state.type == "hidden") {
        /**
         * A little hacky
         */
        if (state.options.hidden) {
          return "Hide Password";
        } else {
          return "Show Password";
        }
      }
      if (state.type == "text" || state.type == "typing") {
        return "Change Text";
      }
      if (state.type == "checked") {
        if (state.value) {
          return "Checked";
        } else {
          return "Unchecked";
        }
      }

      if (state.type == "open") {
        return "Open";
      }

      
      if (state.type == "select") {
        return "Select";
      }

      if (state.type == "pos") {
        return "Move";
      }

      if (state.type == "open") {
        return "Open Popup";
      }

      if (state.type == "navigate") {
        return "Popup Click";
      }
      return "Change";
    },

    getGestureLabel (type) {
      if (this.gestureLabels[type]) {
        return this.gestureLabels[type];
      }
      return type;
    },

    getEventLabel (type) {
      if (this.eventLabels[type]) {
        return this.eventLabels[type];
      }
      return type;
    },

    getScreenName (screenID, shortenIfNeeded = false) {
      if (this.model.screens[screenID] && this.model.screens[screenID].name) {
        let name = this.model.screens[screenID].name;
        if (shortenIfNeeded && name.length > 16) {
          name = name.substring(0, 16) + '...'
        } 
        return name
      }
      return screenID;
    },
    

    getWidgetName (widgetID) {
      if (this.model.widgets[widgetID] && this.model.widgets[widgetID].name) {
        return this.model.widgets[widgetID].name;
      }
      return widgetID;
    },

    /**
     * Filters out bad sessions
     */
    filterEvents (events, anno) {
      var bad = {};
      for (let i = 0; i < anno.length; i++) {
        var a = anno[i];
        if (!a.isValid) {
          bad[a.reference] = true;
        }
      }

      var temp = [];
      var l = events.length;
      for (let i = 0; i < l; i++) {
        var e = events[i];
        if (!bad[e.session]) {
          temp.push(e);
        }
      }

      return temp;
    },

    /**
     * Returns all actionable events
     */
    getActionEvents (df) {
      PerformanceMonitor.start('Util.getActionEvents()')
      const result = df.select("type", "in", [
        "ScreenClick",
        "WidgetClick",
        "WidgetChange",
        "ValidationError",
        "ValidationErrorLine",
        "ScreenLoaded",
        "OverlayLoaded",
        "OverlayRemoved",
        "ScreenGesture",
        "WidgetGesture"
      ]);
      PerformanceMonitor.end('Util.getActionEvents()')
      return result
    },

    /**
     * Returns all click events
     */
    getClickEvents (df) {
      return df.select("type", "in", [
        "ScreenClick",
        "WidgetClick",
        "WidgetChange"
      ]);
    },

    createEmptyImage (x, y, name) {
      return {
        type: "Image",
        name: name,
        x: x,
        y: y,
        w: 100,
        h: 100,
        z: 0,
        props: {},
        has: {
          onclick: true,
          backgroundImage: true,
          border: true
        },
        actions: {},
        style: {
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          borderRightWidth: 0,
          borderLeftWidth: 0,
          borderTopColor: "#333333",
          borderBottomColor: "#333333",
          borderRightColor: "#333333",
          borderLeftColor: "#333333",
          backgroundImage: null
        }
      };
    },

    createEmptyScreen (x, y, name) {
      return {
        x: x,
        y: y,
        h: this.model.screenSize.h,
        w: this.model.screenSize.w,
        name: name,
        type: "Screen",
        style: {
          background: "#ffffff"
        },
        min: {
          w: this.model.screenSize.w,
          h: this.model.screenSize.h
        },
        has: {
          image: true
        },
        props: {
          start: false
        },
        children: []
      };
    },

    getAppTypeIcon (model) {
      if (model.type == "smartphone") {
        return "mdi mdi-crop-portrait";
      } else if (model.type == "tablet") {
        return "mdi mdi-crop-landscape";
      }
      return "mdi mdi-crop-landscape";
    },

    getDomain () {
      var host = window.location.hostname;
      if (host == "127.0.0.1" || host == "flowalytics.com") {
        return "flowalytics.com";
      }
      return "quant-ux.com";
    },

    /***************************************************************************
     * Render helper  functios
     ***************************************************************************/

    ring (label, value, p, node, size, color) {
      if (!size) {
        size = 200;
      }

      if (!color) {
        color = this.RING_BACKGROUND;
      }

      var ring = this.$new(Ring);
      ring.width = 10;
      ring.size = size;
      ring.color = this.RING_FOREGROUND;
      ring.backgroundColor = color;
      ring.setLabel(label);
      ring.setValue(value);
      ring.setPs(p);
      ring.placeAt(node);

      return ring;
    },

    // simpleStats (label, mean, std, node) {
    //   var db = this.getDB();
    //   var cntr = db.div("MatcDashNumberContainer").build(node);
    //   db.div("MatcDashLabel", label).build(cntr);
    //   db.div("MatcDashNumber", mean + " ").build(cntr);
    //   db.div("MatcDashLabelHint", "+/- " + std).build(cntr);

    //   //node.appendChild(cntr);
    // },

    getDB () {
      if (!this.domBuilder) {
        this.domBuilder = new DomBuilder();
      }
      return this.domBuilder;
    },

    progress (label, value, p, id) {
      var node = document.getElementById(id);

      var row = document.createElement("div");
      css.add(row, "row");
      node.appendChild(row);

      var col = document.createElement("div");
      css.add(col, "col-md-4");
      row.appendChild(col);

      var lbl = document.createElement("span");
      lbl.innerHTML = label;
      col.appendChild(lbl);

      col = document.createElement("div");
      css.add(col, "col-md-8");
      row.appendChild(col);

      var bar = this.$new(ProgressBar);
      bar.color = this.PROGRESS_COLOR;
      bar.placeAt(col);
      bar.setValue(p);

      return bar;
    },


    bulletGraph (row, value, emptyMsg) {
      var db = this.getDB();

      for (var i = 0; i < value.length; i++) {
        var item = value[i];

        var tr = db.div().build(row);
        db.div("MatcDashCompareTableLabelSmall", item.label).build(tr);
        var tdProgress = db.div("").build(tr);
        css.add(tdProgress, "MatcDashCompareTableGraph");
        var bar = this.$new(ProgressBar);
        bar.color = this.PROGRESS_COLOR;
        bar.placeAt(tdProgress);
        bar.setValue(item.p);

        if (!item.empty) {
          bar.setLabel(item.a);
        } else {
          if (emptyMsg) {
            bar.setLabel(emptyMsg);
          }
        }
      }
    },

    bulletGraphTable (row, value, emptyMsg) {
      var db = this.getDB();

      var tbody = db
        .table(" MatcDashCompareTable")
        .tbody()
        .build(row);

      for (var i = 0; i < value.length; i++) {
        var item = value[i];

        var tr = db.tr().build(tbody);
        db.td("MatcDashCompareTableLabel", item.label).build(tr);
        var tdProgress = db.td("").build(tr);
        if (!item.empty) {
          css.add(tdProgress, "MatcDashCompareTableGraph");
          var bar = this.$new(ProgressBar);
          bar.color = true;
          bar.placeAt(tdProgress);
          bar.setValue(item.p);
          bar.setLabel(item.a);
        } else {
          if (emptyMsg) {
            db.span("MatcHint MatcLeft", emptyMsg).build(tdProgress);
          }
        }
      }
    },

    createUserImage (user, parent) {
      var imgCntr = document.createElement("div");
      css.add(imgCntr, "MatcUserImageCntr");
      parent.appendChild(imgCntr);

      if (!user || user.role == "guest") {
        let img = document.createElement("div");
        css.add(img, "MatcCommentGuest");
        img.innerHTML = '<span class="mdi mdi-account"></span>';
        imgCntr.appendChild(img);
      } else if (user.image) {
        css.add(imgCntr, "MatcUserImageCntrTrans");

        let img = document.createElement("img");
        img.src = "/rest/user/" + user.id + "/images/" + user.name + "_" + user.lastname + "/" + user.image;
        css.add(img, "MatcUserImage");
        imgCntr.appendChild(img);
      } else {
        let img = document.createElement("div");
        css.add(img, "MatcUserImageNone");
        var span = document.createElement("span");
        img.appendChild(span);
        css.add(span, "MatcMiddle MatcUserLetters");
        span.innerHTML = this.getUserLetter(user);
        imgCntr.appendChild(img);
      }

      return imgCntr;
    },

    getCommentUserName (comment) {
      if ((comment.user && comment.user.name) || comment.user.lastname) {
        return this.getUserName(comment.user);
      }
      return "Guest";
    },

    getUserLetter  (user) {
      let result = ''
      if (user.name) {
        result += user.name.substring(0, 1).toUpperCase();
        if (user.lastname) {
          result += user.lastname.substring(0, 1).toUpperCase();
        }
      } else {
        let parts = user.email.split('.')
        if (parts.length > 0) {
          result += parts[0].substring(0, 1).toUpperCase();
        }
        if (parts.length > 1) {
          result += parts[1].substring(0, 1).toUpperCase();
        }
      }
      return result
    },

    getUserName (user) {
      var result = "";
      if (user.name) {
        result = user.name + " ";
      }
      if (user.lastname) {
        result += user.lastname;
      }
      if (result.length == 0) {
        result = user.email;
      }

      return result;
    },

    resizeSimulatorContainer (model, container, factor) {

      css.add(container, "MatchSimulatorContainer");

      var pos;
      if (model.type == "desktop") {
        pos = win.getBox();
        pos.w = pos.w * factor;
        pos.h = pos.h * factor;
        pos = this.getScaledSize(pos, "width", model);
        container.style.width = Math.round(pos.w) + "px";
        container.style.height = Math.round(pos.h) + "px";
      } else {
        pos = { w: 150, h: 400 };
        pos = win.getBox();
        pos.w = pos.w * factor;
        pos.h = pos.h * factor;

        pos = this.getScaledSize(pos, "height", model);

        container.style.width = Math.ceil(pos.w) + "px";
        container.style.height = Math.ceil(pos.h) + "px";
      }

      return pos;
    },

   
    /***************************************************************************
     * Model access and query functions
     ***************************************************************************/

    getWidgets (screenID, filter) {
      var result = [];
      if (screenID) {
        var screen = this.model.screens[screenID];
        if (screen) {
          var children = screen.children;
          for (let i = 0; i < children.length; i++) {
            let widgetID = children[i];
            let widget = this.model.widgets[widgetID];

            if (widget) {
              result.push(widget);
            }
          }
        }
      } else {
        for (let id in this.model.widgets) {
          let widget = this.model.widgets[id];
          result.push(widget);
        }
      }

      result.sort(function(a, b) {
        return a.y - b.y;
      });

      if (filter) {
        var temp = [];
        for (let i = 0; i < result.length; i++) {
          if (filter(result[i])) {
            temp.push(result[i]);
          }
        }
        result = temp;
      }

      return result;
    },

    /**
     * returns screen from left to right!
     */
    getScreens (app) {
      if (!app) {
        app = this.model;
      }

      var result = [];
      for (let id in app.screens) {
        var screen = app.screens[id];
        result.push(screen);
      }

      /**
       * we order by screen flow!
       */
      result.sort(function(a, b) {
        return a.x - b.x;
      });

      return result;
    },

    getClickableWidgets (screen) {
      var result = [];
      var children = screen.children;
      for (let i = 0; i < children.length; i++) {
        let widgetID = children[i];
        let widget = this.model.widgets[widgetID];
        if (this.isClickable(widget)) {
          result.push(widget);
        }
      }

      result.sort(function(a, b) {
        return a.y - b.y;
      });

      return result;
    },

    getModelChildren (screen) {
      var result = [];

      for (let id in this.model.widgets) {
        let pos = screen.children.indexOf(id);
        if (pos >= 0) {
          result.push(this.model.widgets[id]);
        }
      }

      return result;
    },

    getWidgetsWithoutParent () {
      var result = [];

      var temp = [];
      for (let id in this.model.screens) {
        var screen = this.model.screens[id];
        temp = temp.concat(screen.children);
      }

      for (let id in this.model.widgets) {
        var pos = temp.indexOf(id);
        if (pos < 0) {
          result.push(this.model.widgets[id]);
        }
      }

      return this.getOrderedWidgets(result);
    },

    getBoxById (id) {
      if (this.model.widgets[id]) {
        return this.model.widgets[id];
      }

      if (this.model.screens[id]) {
        return this.model.screens[id];
      }

      if (this.model.templates && this.model.templates[id]) {
        return this.model.templates[id];
      }

      /**
       * Ok, there seems to be an inherited model id???
       *
       *
       */
      if (!id || !id.split) {
        console.debug("getBoxById() > ID is wrong: " + id);
        return null;
      }
      var parts = id.split("@");
      if (parts.length == 2) {
        var widgetID = parts[0];
        var screenID = parts[1];

        var screen = this.model.screens[screenID];
        var parentWidget = this.model.widgets[widgetID];
        if (screen && parentWidget) {
          var parentScreen = this.getHoverScreen(parentWidget);

          var difX = parentScreen.x - screen.x;
          var difY = parentScreen.y - screen.y;

          var copiedParentWidget = lang.clone(parentWidget);

          /**
           * Super important the ID mapping!!
           */
          copiedParentWidget.id = id;
          copiedParentWidget.inherited = parentWidget.id;
          copiedParentWidget.inheritedOrder = 1;

          /**
           * Now lets also put it at the right position!
           */
          copiedParentWidget.x -= difX;
          copiedParentWidget.y -= difY;

          return copiedParentWidget;
        } else {
          console.warn(
            "getBoxById() > No screen or widget for inherited id ",
            id
          );
        }
      }

      return null;
    },

    /***************************************************************************
     * Line helpers
     ***************************************************************************/

    getToLines (box) {
      var result = [];

      for (var id in this.model.lines) {
        var line = this.model.lines[id];
        if (line.to == box.id) {
          result.push(line);
        }
      }

      return result;
    },

    getLines (box, deep) {
      var result = [];

      var _ids = {};

      for (let id in this.model.lines) {
        let line = this.model.lines[id];
        if (line.to == box.id || line.from == box.id) {
          result.push(line);
          _ids[line.id] = true;
        }
      }

      if (box.children && deep) {
        for (let i = 0; i < box.children.length; i++) {
          let childID = box.children[i];
          for (let id in this.model.lines) {
            let line = this.model.lines[id];
            if (!_ids[line.id]) {
              if (line.from == childID || line.to == childID) {
                result.push(line);
              }
            }
          }
        }
      }

      return result;
    },

    hasLine (widget) {
      for (let id in this.model.lines) {
        let line = this.model.lines[id];
        if (line.from == widget.id) {
          return true;
        }
      }
      return false;
    },

    getLine (widget) {
      for (let id in this.model.lines) {
        let line = this.model.lines[id];
        if (line.from == widget.id) {
          return line;
        }
      }
      return null;
    },

    /**
     * For all line drawing this function returns the widget, or in case of an
     * group the bounding box!
     */
    getFromBox (line) {
      let fromPos = this.model.widgets[line.from];

      if (!fromPos) {
        fromPos = this.model.screens[line.from];
      }

      if (!fromPos && this.model.groups) {
        /**
         * no widget, must be a group
         */
        const group = this.model.groups[line.from];
        if (group) {
          const children = this.getAllGroupChildren(group)
          fromPos = this.getBoundingBox(children);
        }
      }

      return fromPos;
    },

    getToBox (line) {
      var to = this.model.screens[line.to];
      if (!to) {
        to = this.model.widgets[line.to];
      }

      if (!to && line.isGroup && this.model.groups) {
        /**
         * no widget, must be a group
         */
        var group = this.model.groups[line.to];
        if (group) {
          to = this.getBoundingBox(group.children);
        }
      }
      return to;
    },

    /***************************************************************************
     * template stuff
     ***************************************************************************/

    getTemplateGroupOrderChildren (group) {
      /**
       * render children, and order by
       * z values
       */
      let children = [];
      for (var i = 0; i < group.children.length; i++) {
        const id = group.children[i];
        const child = this.model.templates[id];
        children.push(child);
      }
      /**
       * oder by z values
       */
      children = this.getOrderedWidgets(children);

      return children;
    },

    /***************************************************************************
     * UI Geometrix helpers
     ***************************************************************************/

    getBoundingBox (ids) {
      return ModelGeom.getBoundingBox(ids, this.model)
    },

    getBoundingBoxByBoxes (boxes) {
       return ModelGeom.getBoundingBoxByBoxes(boxes)
    },

    /**
     * Returns for a box if it is on any of the screens
     */
    getHoverScreen (box) {
      return ModelGeom.getHoverScreen(box, this.model);
    },

    _getHoverScreen (box, model) {
      return ModelGeom.getHoverScreen(box, model);
    },

    _isBoxChild (obj, parent) {
      // http://stackoverflow.com/questions/13390333/two-rectangles-intersection
      if (
        obj.x + obj.w < parent.x ||
        parent.x + parent.w < obj.x ||
        obj.y + obj.h < parent.y ||
        parent.y + parent.h < obj.y
      ) {
        return false;
      }
      return true;
    },

    _isContainedInBox (obj, parent) {
      if (parent) {
        if (
          obj.x >= parent.x &&
          obj.x + obj.w <= parent.w + parent.x &&
          (obj.y >= parent.y && obj.y + obj.h <= parent.y + parent.h)
        ) {
          return true;
        }
      }

      return false;
    },

    /***************************************************************************
     * Object Compare and Change functios
     ***************************************************************************/

    countProps (obj) {
      var count = 0;
      for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
          count++;
        }
      }
      return count;
    },

    objectEquals (v1, v2) {
      if (typeof v1 !== typeof v2) {
        return false;
      }

      if (typeof v1 === "function") {
        return v1.toString() === v2.toString();
      }

      if (v1 instanceof Object && v2 instanceof Object) {
        if (this.countProps(v1) !== this.countProps(v2)) {
          return false;
        }
        var r = true;
        for (let k in v1) {
          r = this.objectEquals(v1[k], v2[k]);
          if (!r) {
            return false;
          }
        }
        return true;
      } else {
        if (v1 === v2) {
          return true;
        } else {
          return false;
        }
      }
    },

    /***************************************************************************
     * Helper functios
     ***************************************************************************/

    round (value) {
      return Math.round(value * 100) / 100;
    },

    formatTime (millis) {
      millis = Math.round(millis / 1000);
      return millis + "s";
    },

    formatSTD (value) {
      return (
        '<span class="MatcDashTableTdHint">( +/- ' +
        this.formatNumber(value) +
        ")</span>"
      );
    },

    formatRound (value) {
      return Math.round(value * 100) / 100;
    },

    formatNumber (value) {
      if (value > 1000000) {
        value = Math.floor(value / 1000000) + "M";
        return value;
      }

      if (value > 1000) {
        value = Math.floor(value / 1000) + "K";
        return value;
      }

      if (value > 100) {
        value = Math.floor(value);
        return value;
      }

      value = Math.round(value * 10) / 10.0;
      return value;
    },

    formatPercent (value) {
      value = Math.round(value * 100);
      var cls = "MatchDashStatusFailure";
      if (value > 70) {
        cls = "MatchDashStatusSuccess";
      } else if (value > 35) {
        cls = "MatchDashStatusOK";
      }
      return '<span class="' + cls + '">' + value + "%</span>";
    },

    formatDate (ts, justDate) {
      return UIUtil.formatDate(ts, justDate)
    },

    formatString (s, l) {
      if (s.length > l) {
        s = s.substring(0, l - 3) + "...";
      }
      return s;
    },

    /***************************************************************************
     * Layer helpers
     ***************************************************************************/

    /**
     * Method to make the z-values pretty and ensure that the z values
     * are consequtive!
     */
    getNormalizeWidgetZValues (values) {
      /**
       * convert values to a sorted list!
       */
      const list = [];
      for (var id in values) {
        list.push({
          id: id,
          z: values[id]
        });
      }
      this.sortWidgetList(list);

      let z = 0;
      let lastZ = null;
      const result = {};
      for (let i = 0; i < list.length; i++) {
        let w = list[i];
        if (lastZ === null || lastZ != w.z) {
          z++;
          lastZ = w.z;
        }
        result[w.id] = z;
      }

      return result;
    },

    getMinZValue (widgets) {
      var min = 100000;
      var l = 0;
      for (var id in widgets) {
        var w = widgets[id];
        min = Math.min(w.z, min);
        l++;
      }
      if (l > 0) {
        return min;
      } else {
        return 0;
      }
    },

    getMaxZValue (widgets) {
      var max = -10000;

      var l = 0;
      for (var id in widgets) {
        var w = widgets[id];
        max = Math.max(w.z, max);
        l++;
      }

      if (l > 0) {
        return max;
      } else {
        return 0;
      }
    },

    getZValues (widgets) {
      var values = {};
      for (var id in widgets) {
        var widget = widgets[id];
        this.fixMissingZValue(widget);
        values[id] = widget.z;
      }
      return values;
    }
  },
  mounted() {}
};
</script>