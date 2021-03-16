
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import css from "dojo/css";
import on from "dojo/on";
import win from "dojo/_base/win";
import DomBuilder from "common/DomBuilder";
import Layout from "core/Layout";
import ModelGeom from 'core/ModelGeom'
import ModelResizer from 'core/ModelResizer'
import SlideLeftButton from 'common/SlideLeftButton'

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

    getIcons: function() {
      return this._matcIcons;
    },

    fixGestures: function(events) {
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
    _distributedPositions: function(type, ids, boundingBox) {
      /**
       * 1) get all subsets (rows or columns) depending on type
       */
      var sets = [];
      for (let i = 0; i < ids.length; i++) {
        var widgetID = ids[i];
        var widget = this.model.widgets[widgetID];
        if (widget) {
          /**
           * Attention: This seems counter intuitive. But for vertical,
           * we have to find columns (x axis) and for horizontal we need
           * rows (z - axis).
           */
          if (type == "vertical") {
            let start = widget.x;
            let end = widget.x + widget.w;
            this._addToDisSet(sets, widget, start, end);
          } else {
            let start = widget.y;
            let end = widget.y + widget.h;
            this._addToDisSet(sets, widget, start, end);
          }
        }
      }

      /**
       * Now resize for every set!
       */
      var result = {};
      var distances = [];
      for (let i = 0; i < sets.length; i++) {
        var set = sets[i];
        var temp = this._distributedPositionsInSubSet(
          type,
          set.children,
          boundingBox
        );
        var tempPositions = temp.positions;
        for (var id in tempPositions) {
          if (!result[id]) {
            result[id] = tempPositions[id];
          } else {
            if (this.logger) {
              this.logger.error(
                "_distributedPositions()",
                "Widget with id is in two sets: " + id
              );
              this.logger.sendError(
                new Error("_distributedPositions() > Sets not ok")
              );
            }
          }
        }
        distances = distances.concat(temp.distances);
      }

      return {
        positions: result,
        distances: distances
      };
    },

    _addToDisSet: function(sets, widget, start, end) {
      var overlapps = [];

      for (let i = 0; i < sets.length; i++) {
        var set = sets[i];
        var overlap = this._getDisOverlap(start, end, set.start, set.end);
        if (overlap > 0) {
          set.start = Math.min(set.start, start);
          set.end = Math.max(set.end, end);
          set.children.push(widget.id);
          set.pos = i;
          overlapps.push(set);
        }
      }
      if (overlapps.length == 0) {
        sets.push({
          start: start,
          end: end,
          children: [widget.id]
        });
      }

      /**
       * If an element is in two sets, the sets should be merged!
       * This is not super important, as we would have in worst
       * case one set, which would fuck up rending in worst case...
       * Actually this should not happen often (or at all)
       */
      if (overlapps.length > 1) {
        if (this.logger) {
          this.logger.warn("_addToDisSet()", "Merging of sets needed");
        }
        var merged = {
          start: start,
          end: end,
          children: []
        };
        for (let i = 0; i < overlapps.length; i++) {
          let temp = overlapps[i];
          merged.start = Math.min(merged.start, temp.start);
          merged.end = Math.max(merged.end, temp.end);
          merged.children = merged.children.concat(temp.children);
          sets.splice(temp.pos, 1);
        }
      }
    },

    _getDisOverlap: function(a, b, c, d) {
      //return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2))
      return (
        Math.min(Math.max(a, b), Math.max(c, d)) -
        Math.max(Math.min(c, d), Math.min(a, b))
      );
    },

    _distributedPositionsInSubSet: function(type, ids, boundingBox) {
      var result = {};

      /**
       * 1) find groups... This can be bounding boxes or single widgets
       */
      var boxes = this._getSelectionGroupPositions(ids);

      /**
       * 2) Now we calculate the positions
       */
      var positions = this._getDistributedPositions(type, boxes, boundingBox);
      var distances = [];
      /**
       * 3) now we fit the group children to their parents...
       */
      for (var id in positions) {
        var newPos = positions[id];
        if (newPos.children) {
          for (var widgetID in newPos.children) {
            var widgetPos = newPos.children[widgetID];
            widgetPos.x = newPos.x + widgetPos.offSetX;
            widgetPos.y = newPos.y + widgetPos.offSetY;
            result[widgetID] = widgetPos;
          }
        } else {
          result[id] = newPos;
        }

        if (newPos.distanceX || newPos.distanceY) {
          distances.push({
            x: newPos.distanceX,
            y: newPos.distanceY
          });
        }
      }

      return {
        positions: result,
        distances: distances
      };
    },

    _getDistributedPositions: function(type, boxes, boundingBox) {
      var positions = {};

      boxes.sort(function(a, b) {
        if (type == "vertical") {
          return a.y - b.y;
        } else {
          return a.x - b.x;
        }
      });
      var sum = 0;
      for (let i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        if (type == "vertical") {
          sum += box.h;
        } else {
          sum += box.w;
        }
      }
      var last = boxes[boxes.length - 1];
      if (type == "vertical") {
        sum = boundingBox.h - sum;
      } else {
        sum = boundingBox.w - sum;
      }

      var space = sum / (boxes.length - 1);
      last = 0;
      var lastBox = null;
      for (let i = 0; i < boxes.length; i++) {
        let widget = boxes[i];

        let widgetPos = {
          x: widget.x,
          y: widget.y,
          h: widget.h,
          w: widget.w,
          children: widget.children
        };
        if (i == 0) {
          if (type == "vertical") {
            widgetPos.y = boundingBox.y;
            last = widgetPos.y + widgetPos.h;
          } else {
            widgetPos.x = boundingBox.x;
            last = widgetPos.x + widgetPos.w;
          }
        } else if (i == boxes.length - 1) {
          if (type == "vertical") {
            widgetPos.y = Math.round(boundingBox.y + boundingBox.h - widget.h);
          } else {
            widgetPos.x = Math.round(boundingBox.x + boundingBox.w - widget.w);
          }
        } else {
          if (type == "vertical") {
            widgetPos.y = Math.round(last + space);
            last = Math.round(widgetPos.y + widgetPos.h);
          } else {
            widgetPos.x = Math.round(last + space);
            last = Math.round(widgetPos.x + widgetPos.w);
          }
        }

        /**
         * Also store distance so we can show later!
         */
        if (lastBox) {
          if (type == "vertical") {
            widgetPos.distanceY = {
              y: lastBox.y + lastBox.h,
              h: widgetPos.y - (lastBox.y + lastBox.h),
              x: Math.round(widgetPos.x + widgetPos.w / 2)
            };
          } else {
            //console.debug("distHor", widgetPos.x - (lastBox.x +lastBox.w))
            widgetPos.distanceX = {
              x: lastBox.x + lastBox.w,
              w: widgetPos.x - (lastBox.x + lastBox.w),
              y: Math.round(widgetPos.y + widgetPos.h / 2)
            };
          }
        }

        positions[widget.id] = widgetPos;
        lastBox = widgetPos;
      }
      return positions;
    },

    /**
     * Get widget positions and bounding boxes for groups...
     */
    _getSelectionGroupPositions: function(ids) {
      var groups = {};
      for (var i = 0; i < ids.length; i++) {
        var widgetID = ids[i];
        var widget = this.model.widgets[widgetID];
        var group = this.getParentGroup(widgetID);
        if (group) {
          if (!groups[group.id]) {
            var bbx = this.getBoundingBox(group.children);
            bbx.children = {};
            groups[group.id] = bbx;
          }
          groups[group.id].children[widgetID] = {
            x: widget.x,
            y: widget.y,
            h: widget.h,
            w: widget.w,
            offSetX: widget.x - bbx.x,
            offSetY: widget.y - bbx.y
          };
        } else {
          groups[widgetID] = {
            x: widget.x,
            y: widget.y,
            h: widget.h,
            w: widget.w
          };
        }
      }
      return this.getArrayFromObject(groups, "id");
    },

    _distributedPositionsBak: function(type, widgets, boundingBox) {
      var positions = {};

      var temp = [];
      for (let i = 0; i < widgets.length; i++) {
        let widgetID = widgets[i];
        let widget = this.model.widgets[widgetID];
        temp.push(widget);
      }

      temp.sort(function(a, b) {
        if (type == "vertical") {
          return a.y - b.y;
        } else {
          return a.x - b.x;
        }
      });

      var sum = 0;
      for (let i = 0; i < widgets.length; i++) {
        let widget = temp[i];
        if (type == "vertical") {
          sum += widget.h;
        } else {
          sum += widget.w;
        }
      }
      var last = temp[temp.length - 1];
      if (type == "vertical") {
        sum = boundingBox.h - sum;
      } else {
        sum = boundingBox.w - sum;
      }

      var space = sum / (widgets.length - 1);
      last = 0;

      for (let i = 0; i < temp.length; i++) {
        let widget = temp[i];
        var widgetPos = { x: widget.x, y: widget.y, h: widget.h, w: widget.w };
        if (i == 0) {
          if (type == "vertical") {
            widgetPos.y = boundingBox.y;
            last = widgetPos.y + widgetPos.h;
          } else {
            widgetPos.x = boundingBox.x;
            last = widgetPos.x + widgetPos.w;
          }
        } else if (i == temp.length - 1) {
          if (type == "vertical") {
            widgetPos.y = Math.round(boundingBox.y + boundingBox.h - widget.h);
          } else {
            widgetPos.x = Math.round(boundingBox.x + boundingBox.w - widget.w);
          }
        } else {
          if (type == "vertical") {
            widgetPos.y = Math.round(last + space);
            last = Math.round(widgetPos.y + widgetPos.h);
          } else {
            widgetPos.x = Math.round(last + space);
            last = Math.round(widgetPos.x + widgetPos.w);
          }
        }
        positions[widget.id] = widgetPos;
      }

      //this.logger.log(0,"calculateDistributedPositions", "enter > " +type +" > space : " + space);

      return positions;
    },

    /**********************************************************************
     * Clone Tool
     **********************************************************************/
    getClones: function(ids, target) {
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

    _correctBoundindBox: function(boundingbox, modelBoundingBox) {
      if (Math.abs(boundingbox.x - modelBoundingBox.x) <= 2) {
        this.logger.log(2, "_correctBoundindBox", "Correct X");
        boundingbox.x = modelBoundingBox.x;
      }

      if (Math.abs(boundingbox.y - modelBoundingBox.y) <= 2) {
        this.logger.log(2, "_correctBoundindBox", "Correct Y");
        boundingbox.y = modelBoundingBox.y;
      }
      return boundingbox;
    },

    /**
     * Gets the new position for a group child
     */
    _getGroupChildResizePosition: function(widget, oldGroup, newGroup, dif) {
      return ModelResizer.getGroupChildResizePosition(widget, oldGroup, newGroup, dif)
    },

    getObjectFromArray: function(list, key) {
      var result = {};
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var value = item[key];
        result[value] = item;
      }
      return result;
    },

    getArrayFromObject: function(obj, key) {
      var result = [];
      for (var i in obj) {
        var item = obj[i];
        if (key) {
          item[key] = i;
        }
        result.push(item);
      }
      return result;
    },

    getWidgetsByDistanceAndType: function(widget, types) {
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

    getObjectLength: function(o) {
      if (o) {
        return Object.keys(o).length;
      } else {
        return 0;
      }
    },

    getEventStateLabel: function(state) {
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

    getGestureLabel: function(type) {
      if (this.gestureLabels[type]) {
        return this.gestureLabels[type];
      }
      return type;
    },

    getEventLabel: function(type) {
      if (this.eventLabels[type]) {
        return this.eventLabels[type];
      }
      return type;
    },

    getScreenName: function(screenID) {
      if (this.model.screens[screenID] && this.model.screens[screenID].name) {
        return this.model.screens[screenID].name;
      }
      return screenID;
    },

    getWidgetName: function(widgetID) {
      if (this.model.widgets[widgetID] && this.model.widgets[widgetID].name) {
        return this.model.widgets[widgetID].name;
      }
      return widgetID;
    },

    /**
     * Filters out bad sessions
     */
    filterEvents: function(events, anno) {
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
    getActionEvents: function(df) {
      return df.select("type", "in", [
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
    },

    /**
     * Returns all click events
     */
    getClickEvents: function(df) {
      return df.select("type", "in", [
        "ScreenClick",
        "WidgetClick",
        "WidgetChange"
      ]);
    },

    createEmptyImage: function(x, y, name) {
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

    createEmptyScreen: function(x, y, name) {
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

    getAppTypeIcon: function(model) {
      if (model.type == "smartphone") {
        return "mdi mdi-cellphone";
      } else if (model.type == "tablet") {
        return "mdi mdi-tablet-ipad";
      }
      return "mdi mdi-laptop";
    },

    getDomain: function() {
      var host = window.location.hostname;
      if (host == "127.0.0.1" || host == "flowalytics.com") {
        return "flowalytics.com";
      }
      return "quant-ux.com";
    },

    /***************************************************************************
     * Render helper  functios
     ***************************************************************************/

    ring: function(label, value, p, node, size, color) {
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

    simpleStats: function(label, mean, std, node) {
      var db = this.getDB();
      var cntr = db.div("MatcDashNumberContainer").build(node);
      db.div("MatcDashLabel", label).build(cntr);
      db.div("MatcDashNumber", mean + " ").build(cntr);
      db.div("MatcDashLabelHint", "+/- " + std).build(cntr);

      //node.appendChild(cntr);
    },

    getDB: function() {
      if (!this.domBuilder) {
        this.domBuilder = new DomBuilder();
      }
      return this.domBuilder;
    },

    progress: function(label, value, p, id) {
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


    bulletGraph: function(row, value, emptyMsg) {
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

    bulletGraphTable: function(row, value, emptyMsg) {
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

    createUserImage: function(user, parent) {
      var imgCntr = document.createElement("div");
      css.add(imgCntr, "MatcUserImageCntr");
      parent.appendChild(imgCntr);

      if (!user || user.role == "guest") {
        let img = document.createElement("div");
        css.add(img, "MatcCommentGuest");
        img.innerHTML = '<span class="glyphicon glyphicon-user"></span>';
        imgCntr.appendChild(img);
      } else if (user.image) {
        css.add(imgCntr, "MatcUserImageCntrTrans");

        let img = document.createElement("img");
        img.src =
          "/rest/user/" +
          user.id +
          "/images/" +
          user.name +
          "_" +
          user.lastname +
          "/" +
          user.image;
        css.add(img, "MatcUserImage");
        imgCntr.appendChild(img);
      } else {
        let img = document.createElement("div");
        css.add(img, "MatcUserImageNone");
        var span = document.createElement("span");
        img.appendChild(span);
        css.add(span, "MatcMiddle");
        span.innerHTML = this.getUserLetter(user);
        imgCntr.appendChild(img);
      }

      return imgCntr;
    },

    getCommentUserName: function(comment) {
      if ((comment.user && comment.user.name) || comment.user.lastname) {
        return this.getUserName(comment.user);
      }
      return "Guest";
    },

    getUserLetter: function(user) {
      if (user.name) {
        return user.name.substring(0, 1).toUpperCase();
      } else {
        return user.email.substring(0, 1).toUpperCase();
      }
    },

    getUserName: function(user) {
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

    resizeSimulatorContainer: function(model, container, factor) {
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

    /**
     * TODO: Could go to canvas/Comment.vue
     */
    renderCommentPopup: function(comment, user, cntr, db, canDelete) {
      css.add(cntr, "MatcActionBox");

      var li = db.div("MatcMarginBottom").build(cntr);

      var item = db.div("MatcCommentRow").build(li);

      var pic = this.createUserImage(comment.user, item);
      css.add(pic, "MatcUserImageCntrSmall MatcCommentPic");

      var txt = db.div("MatcCommentText").build(item);

      db.div("MatcFloatClear").build(li);

      var meta = db.div("MatcCommentMeta").build(txt);

      db.div("MatcCommentMeta", this.getCommentUserName(comment)).build(meta);

      db.div("MatcCommentTime", this.formatDate(comment.created)).build(meta);

      if (comment.userID == user.id) {
        let txtarea = db
          .textarea("form-control MatcIgnoreOnKeyPress", comment.message)
          .build(cntr);
        txtarea.setAttribute("data-gramm_editor", false);

        if (comment.id) {
          css.add(txtarea, "vommondInlineEdit");
        } else {
          txtarea.focus();
        }

        let bar = db.div("MatcButtonBar MatcMarginTopL").build(cntr);

        if (comment.id) {
          /**
           * Create a save button that will only show if people start editing...
           */
          var saveBtn = db.a("MatcButton MatcButtonAnimated ", "Update").build(bar);
          this.tempOwn(on(saveBtn,"mousedown",lang.hitch(this, "onSaveComment", txtarea, comment)));

          let close = db.a("MatcLinkButton", "Close").build(bar);
          this.tempOwn(on(close,"mousedown", lang.hitch(this, "onCloseCommentPopup", comment)));

          let s = this.$new(SlideLeftButton);
          s.placeAt(cntr);
          s.setOptions([
            {
              value: "edit",
              icon: "glyphicon glyphicon-edit",
              callback: function(e) {
                e.preventDefault();
                e.stopPropagation();
                txtarea.focus();
                txtarea.select();
              }
            },
            {
              value: "delete",
              icon: "glyphicon glyphicon-trash",
              callback: lang.hitch(this, "onDeleteComment", comment)
            }
          ]);
        } else {
          let create = db.a("MatcButton", "Create").build(bar);
          this.tempOwn(on(create,"mousedown",lang.hitch(this, "onSaveComment", txtarea, comment)));
          let close = db.a("MatcLinkButton", "Close").build(bar);
          this.tempOwn(on(close,"mousedown",lang.hitch(this, "onCloseCommentPopup", comment)));
        }
      } else {
        if (canDelete) {
          let s = this.$new(SlideLeftButton);
          s.placeAt(cntr);
          s.setOptions([
            {
              value: "delete",
              icon: "glyphicon glyphicon-trash",
              callback: lang.hitch(this, "onDeleteComment", comment)
            }
          ]);
          console.debug("delete", s);
        }

        db.div("MatcCommentMessage", comment.message).build(cntr);
        let bar = db.div("MatcButtonBar MatcMarginTopL").build(cntr);
        let close = db.a("MatcLinkButton", "Close").build(bar);
        this.tempOwn(
          on(
            close,
            "mousedown",
            lang.hitch(this, "onCloseCommentPopup", comment)
          )
        );
      }
    },

    /***************************************************************************
     * Model access and query functions
     ***************************************************************************/

    getWidgets: function(screenID, filter) {
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
    getScreens: function(app) {
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

    getClickableWidgets: function(screen) {
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

    getModelChildren: function(screen) {
      var result = [];

      for (let id in this.model.widgets) {
        let pos = screen.children.indexOf(id);
        if (pos >= 0) {
          result.push(this.model.widgets[id]);
        }
      }

      return result;
    },

    getWidgetsWithoutParent: function() {
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

    getBoxById: function(id) {
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

    getToLines: function(box) {
      var result = [];

      for (var id in this.model.lines) {
        var line = this.model.lines[id];
        if (line.to == box.id) {
          result.push(line);
        }
      }

      return result;
    },

    getLines: function(box, deep) {
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

    hasLine: function(widget) {
      for (let id in this.model.lines) {
        let line = this.model.lines[id];
        if (line.from == widget.id) {
          return true;
        }
      }
      return false;
    },

    getLine: function(widget) {
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
    getFromBox: function(line) {
      var fromPos = this.model.widgets[line.from];

      if (!fromPos) {
        fromPos = this.model.screens[line.from];
      }

      if (!fromPos && this.model.groups) {
        /**
         * no widget, must be a group
         */
        var group = this.model.groups[line.from];
        if (group) {
          fromPos = this.getBoundingBox(group.children);
        }
      }

      return fromPos;
    },

    getToBox: function(line) {
      var to = this.model.screens[line.to];
      if (!to) {
        to = this.model.widgets[line.to];
      }
      return to;
    },

    /***************************************************************************
     * template stuff
     ***************************************************************************/

    getTemplateGroupOrderChildren: function(group) {
      /**
       * render children, and order by
       * z values
       */
      var children = [];
      for (var i = 0; i < group.children.length; i++) {
        var id = group.children[i];
        var child = this.model.templates[id];
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

    _isContainedInBox: function(obj, parent) {
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

    countProps: function(obj) {
      var count = 0;
      for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
          count++;
        }
      }
      return count;
    },

    objectEquals: function(v1, v2) {
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

    // getChanges: function(objOld, objNew, parentPath) {
    //   //console.debug("getChanges")

    //   var changes = [];

    //   /**
    //    * check which things have changed in the new model
    //    */
    //   for (let key in objOld) {
    //     let vOld = objOld[key];
    //     let vNew = objNew[key];

    //     let change = this.getChange(key, vOld, vNew);
    //     if (change) {
    //       change.parent = parentPath;
    //       changes.push(change);
    //     }
    //   }

    //   /**
    //    * check which things were added
    //    */
    //   for (let key in objNew) {
    //     let vOld = objOld[key];
    //     let vNew = objNew[key];

    //     if (vOld === undefined || vOld === null) {
    //       let change = {
    //         name: key,
    //         type: "add",
    //         object: vNew,
    //         parent: parentPath
    //       };
    //       changes.push(change);
    //     }
    //   }

    //   return changes;
    // },

    // getChange: function(key, vOld, vNew) {
    //   if (vNew === undefined || vNew === null) {
    //     return {
    //       name: key,
    //       type: "delete",
    //       oldValue: vOld
    //     };
    //   } else if (typeof vOld !== typeof vNew) {
    //     return {
    //       name: key,
    //       type: "update",
    //       object: vNew,
    //       oldValue: vOld
    //     };
    //   } else if (vOld instanceof Object && vNew instanceof Object) {
    //     if (!this.objectEquals(vOld, vNew)) {
    //       return {
    //         name: key,
    //         type: "update",
    //         object: vNew,
    //         oldValue: vOld
    //       };
    //     }
    //   } else if (vNew !== vOld) {
    //     return {
    //       name: key,
    //       type: "update",
    //       object: vNew,
    //       oldValue: vOld
    //     };
    //   }
    // },

    /***************************************************************************
     * Helper functios
     ***************************************************************************/

    round: function(value) {
      return Math.round(value * 100) / 100;
    },

    formatTime: function(millis) {
      millis = Math.round(millis / 1000);
      return millis + "s";
    },

    formatSTD: function(value) {
      return (
        '<span class="MatcDashTableTdHint">( +/- ' +
        this.formatNumber(value) +
        ")</span>"
      );
    },

    formatRound: function(value) {
      return Math.round(value * 100) / 100;
    },

    formatNumber: function(value) {
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

    formatPercent: function(value) {
      value = Math.round(value * 100);
      var cls = "MatchDashStatusFailure";
      if (value > 70) {
        cls = "MatchDashStatusSuccess";
      } else if (value > 35) {
        cls = "MatchDashStatusOK";
      }
      return '<span class="' + cls + '">' + value + "%</span>";
    },

    formatDate: function(t, justDate) {
      var date = new Date(t);
      if (justDate) {
        return date.toLocaleDateString();
      }
      return date.toLocaleString();
    },

    formatString: function(s, l) {
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
    getNormalizeWidgetZValues: function(values) {
      /**
       * convert values to a sorted list!
       */
      var list = [];
      for (var id in values) {
        list.push({
          id: id,
          z: values[id]
        });
      }
      this.sortWidgetList(list);

      var z = -1;
      var lastZ = null;
      var result = {};
      for (var i = 0; i < list.length; i++) {
        var w = list[i];
        if (lastZ === null || lastZ != w.z) {
          z++;
          lastZ = w.z;
        }
        result[w.id] = z;
      }

      return result;
    },

    getMinZValue: function(widgets) {
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

    getMaxZValue: function(widgets) {
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

    getZValues: function(widgets) {
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