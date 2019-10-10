<script>
import lang from "dojo/_base/lang";
import topic from "dojo/topic";
import domGeom from "dojo/domGeom";
import css from "dojo/css";

export default {
  name: "DnD",
  mixins: [],
  data:function() {
    return {
      dndUpdateCopiedWidgetsOnMove: false
    };
  },
  components: {},
  methods: {
    setBoxClickCallback (methodName) {
      this._boxClickCallback = methodName;
    },

    setCanvasClickCallback (methodName) {
      this._canvasClickCallback = methodName;
    },

    cleanUpClickCallbacks () {
      this._boxClickCallback = null;
      this._canvasClickCallback = null;
    },

    dispatchBoxClickCallback (id, div, pos, e) {
      this[this._boxClickCallback](id, div, pos, e);
    },

    dispatchCanvasClickCallback (id, div, pos, e) {
      this[this._canvasClickCallback](id, div, pos, e);
    },

    /**********************************************************************
     * Container DnD
     **********************************************************************/

    onCanvasDnDStart (id, div, pos) {
      this.logger.log(3,"onCanvasDnDStart", "enter > " + id + ' ' + pos);
      this.setDnDMinTime(0);
      this._dndContainerPos = domGeom.position(this.container);
      this._dndDomPos = domGeom.position(this.domNode);
      this.beforeDND();
    },

    onCanvasDnDMove (id, div, pos) {
      this.canvasPos.x = pos.x;
      this.canvasPos.y = pos.y;
      this.updateScrollHandlers();
      this.setState(5);
      return true;
    },

    onCanvasDnDEnd (id, div, pos) {
      this.logger.log(3,"onCanvasDnDEnd", "enter > x:" + pos.x + " y:" + pos.y);
      this.canvasPos.x = pos.x;
      this.canvasPos.y = pos.y;
      delete this._dndContainerPos;
      delete this._dndDomPos;
      this.setState(0);
    },

    onCanvasDnClick (id, div, pos, e) {
      this.logger.log(3, "onCanvasDnClick", "enter > " + id + " " + this._canvasClickCallback);

      if (this._canvasClickCallback) {
        this.dispatchCanvasClickCallback(id, div, pos, e);
        return;
      }

      /**
       * the d3.js mouse events work like shit!!! We hack
       * around by listenering to mouse over and mourout events
       */
      var p2 = this.getCanvasMousePosition(e);
      if (!this.checkIfLineWasCLicked(p2)) {
        this.onCanvasSelected();
      }
    },

    onCanvasDnDHelp () {
      var now = new Date().getTime();
      if (!this.dndwarningShown || now - this.dndwarningShown > 5000) {
        this.showError("To move the canvas use the move tool, press SHIFT or change the settings...");
        this.dndwarningShown = now;
      }
    },

    beforeDND () {
      this._dragNDropIgnoreGroup = false;
    },

    /**********************************************************************
     * Screen DnD
     **********************************************************************/

    onScreenDndStart (id) {
      this.logger.log(3, "onScreenDndStart", "entry");
      this.beforeDND();
      this._dragNDropBoxPositions = {};
      var screen = this.model.screens[id];
      return screen;
    },

    onScreenDndMove (id, div, pos, dif) {
      topic.publish("matc/canvas/click", "", "");
      this.setState(1);
      this.cleanUpDebugLines();

      if (!this._alignmentToolInited) {
        let screen = this.model.screens[id];
        this.alignmentStart("screen", screen, "All");
      }

      let screen = this.model.screens[id];
      let temp = { x: pos.x, y: pos.y, h: screen.h, w: screen.w };
 

      if (this.isInContainer(temp)) {
        this._dragNDropBoxPositions[id] = temp;

        /**
         * update also the background screen
         */
        let backgroundDiv = this.screenBackgroundDivs[id];
        let job = {
          div: backgroundDiv,
          pos: temp,
          id: id + "backGround"
        };
        this.addDragNDropRenderJob(job);

        /**
         * Also update resize handlers. The _DragNDrop._dragNDropUpDateUI()
         * method will perform the updaze  *IF AND ONLY IFF*
         * this if if the moved widget(s) matches the one of the
         * resizeHnalder.
         */
        if (this._resizeHandlerBox) {
          let resizePos = {
            w: this._resizeHandlerBox.w,
            h: this._resizeHandlerBox.h,
            x: this._resizeHandlerBox.x + dif.x,
            y: this._resizeHandlerBox.y + dif.y
          };
          this._dragNDropRenderResizeHandlerJob = resizePos;
        }

        /**
         * Do not forget to update comments. Implemented in Comment.js
         */
        this.updateCommentPosition(id, temp);

        /**
         * also update all contained widgets
         */
        this.updateChildren(screen, pos, dif);

        /**
         * also update all lines
         */
        this.onUpdateLines(screen);

        return true;
      }
      return false;
    },

    /**
     * update all contained children recursively and will also move
     * the mutliSelectionStuff
     */
    updateChildren (box, pos, dif) {
      /**
       * Update contained elements, e.g widgets in screen
       * 
       * FIXME: For containers this does not seem to work 
       * properly! Because the children property is only in
       * the inhreited model in here 
       * but not in the controller! 
       */
      if (box.children && !box.isContainer) {
        for (let i = 0; i < box.children.length; i++) {
          let widgetID = box.children[i];
          this._updateChildWidget(widgetID, pos, dif);
        }
      }

      /**
       * do live updates on copied (master copies) elements??
       */
      if (box.copies && this.dndUpdateCopiedWidgetsOnMove) {
        for (let i = 0; i < box.copies.length; i++) {
          let widgetID = box.copies[i];
          this._updateChildWidget(widgetID, pos, dif);
        }
      }

      if (this._dragNDropChildren) {
        for (let i = 0; i < this._dragNDropChildren.length; i++) {
          let widgetID = this._dragNDropChildren[i];
          this._updateChildWidget(widgetID, pos, dif);
        }
      }
    },

    _updateChildWidget (widgetID, pos, dif) {
      var widget = this.model.widgets[widgetID];
      if (widget) {
        var div = this.widgetDivs[widgetID];
        var widgetPos = {
          x: dif.x + widget.x,
          y: dif.y + widget.y,
          h: widget.h,
          w: widget.w
        };

        var job = {
          div: div,
          pos: widgetPos,
          id: widgetID
        };

        this.addDragNDropRenderJob(job);
        this._dragNDropBoxPositions[widgetID] = widgetPos;

        /**
         * update also the background divs
         */
        this._updateWidgetBackground(widgetID, widgetPos);

        this.onUpdateLines(widget);
      } else {
        console.warn("Widget with ", widgetID, " doe snot exits");
      }
    },

    _updateWidgetBackground (widgetID, pos) {
      var backgroundDiv = this.widgetBackgroundDivs[widgetID];
      if (backgroundDiv) {
        var job = {
          div: backgroundDiv,
          pos: pos,
          id: widgetID + "backGround"
        };
        this.addDragNDropRenderJob(job);
      } else {
        console.warn("_updateWidgetBackground", "No Background", widgetID);
      }
    },

    onScreenDndEnd (id, div, pos, dif) {
      this.logger.log(
        3,
        "onScreenDndEnd",
        "enter > x:" + pos.x + " y:" + pos.y
      );

      this.cleanUpAlignment();

      this.getController().updateScreenPosition(id, pos, true);

      this._dragNDropBoxPositions = null;

      this.onSelectionMoved(pos, dif, id);

      this.setState(0);
    },

    onScreenDndClick (id, div, pos, e) {
      this.logger.log(2, "onScreenDndClick", "entry > " + id);

      if (this._boxClickCallback) {
        this.dispatchBoxClickCallback(id, div, pos, e);
        return;
      }

      this.onScreenSelected(id);

      this.setState(0);
    },

    /**********************************************************************
     * Widget DnD
     **********************************************************************/

    onWidgetDndStart (id, div, pos, e) {
      this.logger.log(1, "onWidgetDndStart", "entry > " + id);

      /**
       * we must avoid touchpad based misplacements. Thereore we set *only* for
       * the widgets some delay
       */
      var ids = this.getSelectedIds();
      if (ids == null) {
        this.setDnDMinTime(0);
      }

      this._dragNDropBoxPositions = {};
      /**
       * make sure inline edit is flushed,
       * because a remember or some other stuff might
       * happen
       */
      this.inlineEditStop();

      this._addDnDChildren(id);

      /**
       * make sure lines are also updated for groups!
       */
      var group = this.getTopParentGroup(id);
      if (group) {
        // widget has no line??
        this._dragNDropLineFromBox = group;
        this._dragNDropBoundingBox = this.getBoundingBox(group.children);
      }

      /**
       * add class to dnd widget
       */
      if (this.widgetDivs[id]) {
        this._dndMoveDiv = this.widgetDivs[id];
        css.add(this._dndMoveDiv, "MatcBoxMoving");
      }

      this._resizeCursor = "MatcCanvasResizeCursorAll";
      css.add(this.container, this._resizeCursor);

      if (e.ctrlKey) {
        /**
         * this will open some stupid dialog, we should stop that!
         */
        this.stopEvent(e);
      }

      this._dragNDropBoxWidgetStart = pos;

      var widget = this.model.widgets[id];
      return widget;
    },

    onWidgetDndMove (id, div, pos, dif) {
      topic.publish("matc/canvas/click", "", "");
      /**
       * setup alignment tool. In case of multi or group use bounding
       * box, but if the group child was explicitly selected (second click)
       * just use the widget
       */
      if (!this._alignmentToolInited) {
        let widget = this.model.widgets[id];
        if (widget) {
          let group = this.getParentGroup(id);
          // We only want to move the bounding box, if the moving widgets
          // as acutually part of the selection!
          if (this._selectMulti && this._selectMulti.indexOf(id) >= 0) {
            let boundingBox = this.getBoundingBox(this._selectMulti);
            boundingBox.id = id;
            this.alignmentStart("boundingbox", boundingBox, "All", this._selectMulti);
          } else if (group && !this._dragNDropIgnoreGroup) {
            let boundingBox = this.getBoundingBox(group.children);
            boundingBox.id = id;
            this.alignmentStart("boundingbox", boundingBox, "All", group.children);
          } else {
            this.alignmentStart("widget", widget, "All");
          }
        } else {
          this.logger.error("onWidgetDndMove", "No widget with id", id);
        }
      }

      this.setState(2);
      this.cleanUpDebugLines();

      let widget = this.model.widgets[id];
      if (widget) {
        let temp = {
          x: pos.x,
          y: pos.y,
          h: widget.h,
          w: widget.w,
          type: widget.type
        };
        if (this.isInContainer(temp)) {
          this._dragNDropBoxPositions[id] = temp;

          /**
           * Update the div
           */
          this._updateWidgetBackground(id, temp);

          /**
           * also update all contained widgets
           */
          this.updateChildren(widget, temp, dif);

          /**
           * Also update resize handlers. The _DragNDrop._dragNDropUpDateUI()
           * method will perform the updaze  *IF AND ONLY IFF*
           * this if if the moved widget(s) matches the one of the
           * resizeHnalder.
           */
          if (this._resizeHandlerBox) {
            var resizePos = {
              w: this._resizeHandlerBox.w,
              h: this._resizeHandlerBox.h,
              x: this._resizeHandlerBox.x + dif.x,
              y: this._resizeHandlerBox.y + dif.y
            };
            this._dragNDropRenderResizeHandlerJob = resizePos;
          }

          /**
           * also update all lines
           */
          if (this._dragNDropLineFromBox) {
            /**
             * Also update lines for group
             */
            var temp2 = {
              x: pos.x,
              y: pos.y,
              h: this._dragNDropBoundingBox.h,
              w: this._dragNDropBoundingBox.w
            };
            this._dragNDropBoxPositions[this._dragNDropLineFromBox.id] = temp2;
            this.onUpdateLines(this._dragNDropLineFromBox);
          } else {
            this.onUpdateLines(widget);
          }

          return true;
        }
      } else {
        this.logger.error("onWidgetDndMove", "No widget with id", id);
      }

      return false;
    },

    onUpdateLines (box) {
      for (var id in this.model.lines) {
        var line = this.model.lines[id];
        if (line.to == box.id || line.from == box.id) {
          var from = this._dragNDropBoxPositions[line.from];
          if (!from) {
            from = this.getFromBox(line);
          }
          var to = this._dragNDropBoxPositions[line.to];
          if (!to) {
            to = this.getToBox(line); //this.model.screens[line.to];
          }

          this.updateLine(line, from, to);
        }
        /**
         * We have an issue here with group lines. They are not updated
         */
      }
    },

    isMasterWidget (widget) {
      if (widget) {
        return (
          (widget.inheritedCopies != null && widget.inheritedCopies != undefined) ||
          (widget.copies != null && widget.copies != undefined)
        );
      }
      return false;
    },

    onWidgetDndEnd (id, div, pos, dif) {
      this.logger.log(0, "onWidgetDndEnd", "enter > x:" + pos.x + " y:" + pos.y);

      /**
       * In Select.js we should recalculate the bounding box.
       */

      this.cleanUpAlignment();

      if (this._dragNDropChildren) {
        // multi move
        let positions = {};
        positions[id] = pos;
        let hasCopies = false;
        for (let i = 0; i < this._dragNDropChildren.length; i++) {
          let widgetID = this._dragNDropChildren[i];
          let widget = this.model.widgets[widgetID];
          //console.debug(widget.name, widget);
          hasCopies = hasCopies || this.isMasterWidget(widget);
          if (widget) {
            let widgetPos = {
              x: dif.x + widget.x,
              y: dif.y + widget.y,
              h: widget.h,
              w: widget.w
            };
            positions[widgetID] = widgetPos;
          } else {
            console.warn("No Widget", widgetID);
          }
        }

        this.getController().updateMultiWidgetPosition(positions, false, pos, hasCopies, id);
      } else if (this._selectMulti && this._selectMulti.indexOf(id) >= 0) {
        // && this._selectMulti.indexOf(id) >=0
        /**
         * This should actually nether be called. If we have a multi move, there
         * should be also dndChildren....
         */
        let positions = {};
        positions[id] = pos;
        let hasCopies = false;
        for (let i = 0; i < this._selectMulti.length; i++) {
          let widgetID = this._selectMulti[i];
          let widget = this.model.widgets[widgetID];
          hasCopies = hasCopies || this.isMasterWidget(widget);
          let widgetPos = {
            x: dif.x + widget.x,
            y: dif.y + widget.y,
            h: widget.h,
            w: widget.w
          };
          positions[widgetID] = widgetPos;
        }
        /**
         * Make sure we pass the second param as false, otherwise we have a full
         * render.
         */
        this.getController().updateMultiWidgetPosition(positions, false, pos, hasCopies, id);
      } else {
        // single widgte move
        console.debug('setWidgetPosition')
        let widget = this.model.widgets[id];
        if (widget) {
          var modelPos = this.getController().updateWidgetPosition(id, lang.clone(pos), false, this.isMasterWidget(widget));
          try {
            /**
             * Update position to avoid snapping bumps: Could be called from controller
             * FIXME: This causes the issues! Why was I doing this? The position
             * will be done propertlz in the controller. In worst case the current
             * rendering would be wrong by 1px.
             */
            var zoomed = this.getZoomedBox(modelPos,this.getZoomFactor(), this.getZoomFactor());
            this.setWidgetPosition(widget.id, zoomed);
            pos = zoomed;
          } catch (e) {
            this.logger.sendError(e);
          }
        } else {
          var e = new Error("No widget with id >" + id);
          this.logger.error("onWidgetDndEnd", "No widget with id >" + id);
          this.logger.sendError(e);
        }
      }

      this.onSelectionMoved(pos, dif, id);

      this.cleanUpWidgetDnD();

      this.setState(0);
    },

    /**
     * One of the most important methods! It handles the clicks
     * and the convas depending on the current state / selection!
     *
     */
    onWidgetDndClick (id, div, pos, e) {
      this.logger.log(2, "onWidgetDndClick", "entry > " + id);

      this.stopEvent(e);

      /**
       * we set the ignoreGroupFlag to false!
       */
      this.beforeDND();

      this.cleanUpAlignment();

      /**
       * 1) If there is any click callback dispatch it!
       */
      if (this._boxClickCallback) {
        this.dispatchBoxClickCallback(id, div, pos, e);
        return;
      }

      /**
       * 2) If SHIFT, CTRL or ALT is pressed, we add things to an selection
       */
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        /**
         * FIXME: This is an evil bug! This open in FireFox an popup!
         * Maybe we have to listen to RMC and stop it..
         */
        if (!this._selectMulti) {
          this._selectMulti = [];
        }

        /**
         * Expand exiting selections
         */
        if (this._selectGroup) {
          this._selectMulti = this._selectMulti.concat(this._selectGroup.children);
        }
        if (this._selectWidget) {
          this._selectMulti.push(this._selectWidget.id);
        }

        let group = this.getTopParentGroup(id);
        if (group) {
          this._selectMulti = this._selectMulti.concat(group.children);
        } else {
          if (this._selectMulti.indexOf(id) < 0) {
            this._selectMulti.push(id);
          } else {
            /**
             * FIXME: remove from selected...
             */
            //console.debug("remove", id, this._selectMulti.indexOf(id));
            //this._selectMulti = this._selectMulti.splice(this._selectMulti.indexOf(id),1);
          }
        }

        this.onMutliSelected(this._selectMulti);
      } else {
        let group = this.getTopParentGroup(id);
        console.debug('DND.onWidgetDndClick()', id, group)
        /**
         * If we have a group, we have to dispatch the clicks like follows
         */
        if (group) {
          if (!this._selectGroup) {
            if (this._selectWidget && this._selectWidget.id == id) {
              /**
               * 3) Click => Start in line editing (force parameter not set)
               */
              this.onWidgetSelected(id);
              this._dragNDropIgnoreGroup = true;
            } else if (this._selectWidget && this._selectWidget.id != id) {
              /**
               * We have to to check if we have already a widget from the current
               * group selected. This means the selectedGroup is null.
               * If we are in the same group select the new widget, other wise
               * the new group.
               * 
               * Since 2.1.3 we have sub group and we want the top group, but here
               * we stull want to allow sub selection
               */
              var widgetGroup = this.getParentGroup(this._selectWidget.id);
              if (widgetGroup && widgetGroup.id == group.id) {
                /**
                 * Widget change in current group
                 */
                this.onWidgetSelected(id, true);
                this._dragNDropIgnoreGroup = true;
              } else {
                /**
                 * Change to other group
                 */
                this.onGroupSelected(group.id);
              }
            } else {
              /**
               * 1 Click => Select the Group
               */
              this.onGroupSelected(group.id);
            }
          } else {
            if (this._selectGroup.id == group.id) {
              /**
               * 2 Click => Select the widget and make sure the group is not included in the dnd.
               * Also, set force parameter to true to avoid inline editing
               */
              this.onWidgetSelected(id, true);
              this._dragNDropIgnoreGroup = true;
            } else {
              /**
               * Selection of other group
               */
              this.onGroupSelected(group.id);
            }
          }
        } else {
          /**
           * 5) Else select widget
           */
          this.onWidgetSelected(id);
        }
      }

      this.cleanUpWidgetDnD();
      this.setState(0);
    },

    _addDnDChildren (id) {
      if (this._dragNDropIgnoreGroup) {
        return;
      }
      
      /**
       * 1) check if there is a group we have to drag
       */
      if (!this._selectGroup) {
        let group = this.getTopParentGroup(id);
        if (group) {
          this._dragNDropChildren = group.children;
          this._addDNDChildrenCopies();
        }
      } else {
        /**
         * Since 2.1.3 we need also things
         */
        let group = this.getTopParentGroup(id);
        if (group) {
          /**
           * Prevent that if there is a group selection,
           * but the moved widget is not form the group, we
           * do not add the groups children.
           */
          if (this._selectGroup.id == group.id) {
            this._dragNDropChildren = this._selectGroup.children;
          } else {
            this._dragNDropChildren = group.children;
          }
          //this._addDNDChildrenCopies();
        }
      }

      /**
       * 2) check if there is a multi selection
       */
      if (this._selectMulti) {
        /**
         * only move multi selection in case the clicked
         * widget is patr of it
         */
        if (this._selectMulti.indexOf(id) > -1) {
          this._dragNDropChildren = this._selectMulti;
        }
        //this._addDNDChildrenCopies();
      }
    },

    _addDNDChildrenCopies () {
      if (this._dragNDropChildren) {
        var children = [];
        for (var i = 0; i < this._dragNDropChildren.length; i++) {
          var id = this._dragNDropChildren[i];
          var widget = this.model.widgets[id];
          if (widget) {
            if (widget.copies) {
              children = children.concat(widget.copies);
            }
            if (widget.inheritedCopies) {
              children = children.concat(widget.inheritedCopies);
            }
          }
        }
        if (children.length > 0 && children.length < 20) {
          // do not overload thread
          this._dragNDropChildren = this._dragNDropChildren.concat(children);
        }
      }
    },

    cleanUpWidgetDnD () {
      if (this._resizeCursor) {
        css.remove(this.container, this._resizeCursor);
      }

      if (this._dndMoveDiv) {
        css.remove(this._dndMoveDiv, "MatcBoxMoving");
        delete this._dndMoveDiv;
      }

      delete this._dragNDropBoxPositions;
      delete this._dragNDropChildren;
      delete this._dragNDropLineFromBox;
      delete this._dragNDropBoundingBox;
      delete this._dragNDropBoxWidgetStart;
    },

    /**********************************************************************
     * Lines DnD
     **********************************************************************/

    onLinePointDnDStart (point) {
      this.alignmentStart("line", point, "LeftUp");

      /**
       * we want to use the right model,
       * not the getStyle() from _DragNDrop.js
       */
      var line = this.model.lines[point.id];
      var p = line.points[point.i - 1];
      return p;
    },

    onLinePointDnDMove (point, div, pos) {
      /**
       * we do all the line rendering in here again! Keep in sync with the
       * layout method!
       */
      var line = this.model.lines[point.id];

      var from = this.getFromBox(line);
      var to = this.getToBox(line);

      var supportedLine = this.layoutAddSupportPoints(from, to, line);

      /**
       * now set the new point position!
       */
      supportedLine[point.i].x = pos.x;
      supportedLine[point.i].y = pos.y;

      this.layoutCorrectAnchorPoints(supportedLine);
      let layoutedLine = this.layoutCorrectArrow(supportedLine);

      var job = {
        line: layoutedLine
      };

      if (!this._lineUpdateJobs) {
        this._lineUpdateJobs = {};
      }

      this._lineUpdateJobs[line.id] = job;

      if (!window.requestAnimationFrame) {
        console.warn("No requestAnimationFrame()");
        this._lineUpdateUI();
      } else {
        var callback = lang.hitch(this, "_lineUpdateUI");
        requestAnimationFrame(callback);
      }
    },

    onLinePointDnDEnd (point, div, pos) {
      this.cleanUpAlignment();
      var i = point.i - 1;
      this.getController().updateLinePoint(point.id, i, pos);
    },

    onLinePointDnClick () {
      this.cleanUpAlignment();
    }
  },
  mounted() {}
};
</script>