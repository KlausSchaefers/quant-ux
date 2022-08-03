<script>
import lang from "dojo/_base/lang";
import topic from "dojo/topic";
import domGeom from "dojo/domGeom";
import css from "dojo/css";
import CoreUtil from 'core/CoreUtil'

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
      //console.warn('DEPRECTAED dispatchBoxClickCallback()')
      this[this._boxClickCallback](id, div, pos, e);
    },

    dispatchCanvasClickCallback (id, div, pos, e) {
      //console.warn('DEPRECTAED dispatchCanvasClickCallback()')
      this[this._canvasClickCallback](id, div, pos, e);
    },

    /**********************************************************************
     * Container DnD
     **********************************************************************/

    onCanvasDnDStart (id, div, pos) {
      this.logger.log(3,"onCanvasDnDStart", "enter > " + id + ' ' + pos);
      this.setDnDMinTime(0);
      this._dndContainerPos = domGeom.position(this.dndContainer);
      this._dndDomPos = domGeom.position(this.domNode);
      this.beforeDND();
    },

    onCanvasDnDMove (id, div, pos) {
      this.logger.log(3,"onCanvasDnDMove", "enter > x:" + pos.x + " y:" + pos.y);
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
         * update also the background screen & grid
         */
        let zoomedPos = this.getBackgroundPos(temp, this.zoom, this.zoom);
        let backgroundDiv = this.screenBackgroundDivs[id];
        let job = {
          zoom: true,
          div: backgroundDiv,
          pos: zoomedPos,
          id: id + "backGround"
        };
        this.addDragNDropRenderJob(job);


        let gridDiv = this.screenGridDivs[id];
        let job2 = {
          zoom: true,
          div: gridDiv,
          pos: zoomedPos,
          id: id + "grud"
        };
        this.addDragNDropRenderJob(job2);

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
        this.updateLines(screen);

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
      const widget = this.model.widgets[widgetID];
      if (widget) {
        const div = this.widgetDivs[widgetID];
        const widgetPos = {
          x: dif.x + widget.x,
          y: dif.y + widget.y,
          h: widget.h,
          w: widget.w
        };

        const job = {
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

        this.updateLines(widget);
      } else {
        console.warn("Widget with ", widgetID, " doe snot exits");
      }
    },

    _updateWidgetBackground (widgetID, pos) {
      const backgroundDiv = this.widgetBackgroundDivs[widgetID];

      if (backgroundDiv) {
        const job = {
          zoom: true,
          div: backgroundDiv,
          pos: this.getBackgroundPos(pos),
          id: widgetID + "backGround"
        };
        this.addDragNDropRenderJob(job);
      } else {
        console.warn("_updateWidgetBackground", "No Background", widgetID);
      }
    },

    _updateWidgetDND (widgetID, pos) {
        const dndDiv = this.widgetDivs[widgetID];
        if (dndDiv) {
          // we do not call a job, because
          // on Dnd end, the jobs are not executed...
          requestAnimationFrame(() => {
            this.domUtil.setPos(dndDiv, pos)
          })
        } else {
         console.warn("_updateWidgetDND", "No DND", widgetID);
        }
    },

  
    getBackgroundPos(pos) {
      return CoreUtil.getUnZoomedBoxCopy(pos, this.zoom, this.zoom);
    },

    onScreenDndEnd (id, div, pos, dif) {
      this.logger.log(3, "onScreenDndEnd", "enter > x:" + pos.x + " y:" + pos.y);

      this.cleanUpAlignment();
      this.getController().updateScreenPosition(id, lang.clone(pos), true);

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
      const ids = this.getSelectedIds();
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
      const group = this.getTopParentGroup(id);
      if (group) {
        this._dragNDropLineFromBox = group;
        this._dragNDropBoundingBox = this.getBoundingBox(group.children);
        this._dragNDropOffset = {
          x: this._dragNDropBoundingBox.x - pos.x,
          y: this._dragNDropBoundingBox.y - pos.y
        }
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

      this.registerKeyBoardListener(e => this.onWidgetDNDKeyDown(e))
      var widget = this.model.widgets[id];


      return widget;
    },

    onWidgetDNDKeyDown (e, isUp= false) {
      this.logger.log(-1, "onWidgetDNDKeyDown", "enter", isUp)
      if (!this._dragNDropBoxWidgetStart) {
        this.logger.error("onWidgetDNDKeyDown", "no start")
        this.cleanUpKeyBoardListener()
        return
      }

      const synthEvent = {
        pageX: this._lastMouseMoveEvent.pageX,
        pageY: this._lastMouseMoveEvent.pageY,
        altKey: e.altKey
      }
      this.onDragMove(synthEvent)
      
    },

    onWidgetDndMove (id, div, pos, dif, e) {
      topic.publish("matc/canvas/click", "", "");

      if (!this._alignmentToolInited) {
        this.startAligmentToolForWidget(id)
      }

      this.setState(2);
      this.cleanUpDebugLines();


      const widget = this.model.widgets[id];
      if (widget) {
        const temp = {
            x: pos.x,
            y: pos.y,
            h: widget.h,
            w: widget.w,
            type: widget.type
        };
        // only move if we are in the canvas
        if (this.isInContainer(temp)) {
          this._dragNDropBoxPositions[id] = temp;

          if (this.isWidgetDNDCopy(e)) {
            this.renderWidgetDNDCopy(id, temp, widget, dif, pos)
          } else {
            this.renderWidgetDND(id, temp, widget, dif, pos)
          }
        
          return true;
        }
      } else {
        this.logger.error("onWidgetDndMove", "No widget with id", id);
      }

      return false;
    },

    renderWidgetDNDCopy (id, temp, widget, dif, pos) {
  
      const startPos = this._dragNDropBoxWidgetStart
      if (!this._dragNDropCopyPlaceHolder) {
        // create a box
        const div = this.createBox({
          x: startPos.w,
          y: startPos.h,
          w: pos.w,
          h: pos.h
        });
        css.add(div, "MatcBoxPlaceHolder");
        this.dndContainer.appendChild(div);
        this._dragNDropCopyPlaceHolder = div

        // reset dnd position
        this._updateWidgetBackground(id, startPos);
        this._updateWidgetDND(id, startPos)
        this.updateChildren(widget, startPos, {x:0, y:0});
       
   
        // set reference so we can also snapp the copy
        // to itself
        if(this._alignmentTool && this._alignmentTool.setCopyReference){ 
          this._alignmentTool.setCopyReference(id)
        }
      }

      const correctedPOs = this.getCorrectedCopyPosition(pos)
     

      // render new position of the placeholder
      const job = {
        zoom: true,
        div: this._dragNDropCopyPlaceHolder,
        pos: correctedPOs,
        id: "dndCopyPlaceHolder"
      };
      this.addDragNDropRenderJob(job);

    },

    getCorrectedCopyPosition (pos) {
      if (this._dragNDropOffset) {
          pos = lang.clone(pos)
          pos.x = pos.x + this._dragNDropOffset.x
          pos.y = pos.y + this._dragNDropOffset.y
        }
      return pos
    },

    renderWidgetDND (id, temp, widget, dif, pos) {
        this.cleanUpDNDCopyPlaceHolder()
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
          this._dragNDropRenderResizeHandlerJob = {
            w: this._resizeHandlerBox.w,
            h: this._resizeHandlerBox.h,
            x: this._resizeHandlerBox.x + dif.x,
            y: this._resizeHandlerBox.y + dif.y
          };
        }

        /**
         * also update all lines
         */
        if (this._dragNDropLineFromBox) {
          /**
           * Also update lines for group
           */
          const temp2 = {
            x: pos.x,
            y: pos.y,
            h: this._dragNDropBoundingBox.h,
            w: this._dragNDropBoundingBox.w
          };
          this._dragNDropBoxPositions[this._dragNDropLineFromBox.id] = temp2;
          this.updateLines(this._dragNDropLineFromBox);
        } else {
          this.updateLines(widget);
        }
    },

    startAligmentToolForWidget(id) {
        /**
         * setup alignment tool. In case of multi or group use bounding
         * box, but if the group child was explicitly selected (second click)
         * just use the widget
         */
        const widget = this.model.widgets[id];
        if (widget) {
          const group = this.getParentGroup(id);
          // We only want to move the bounding box, if the moving widgets
          // as acutually part of the selection!
          if (this._selectMulti && this._selectMulti.indexOf(id) >= 0) {
            const boundingBox = this.getBoundingBox(this._selectMulti);
            boundingBox.id = id;
            this.alignmentStart("boundingbox", boundingBox, "All", this._selectMulti);
          } else if (group && !this._dragNDropIgnoreGroup && this._dragNDropChildren) {
              /**
             * Since 2.1.3 we have nested groups. The bounding box
             * is already determined bz the _dragNDropChildren children
             * which were initlized before!
             */
            const children = this._dragNDropChildren
            const boundingBox = this.getBoundingBox(children);
            boundingBox.id = id;
            this.alignmentStart("boundingbox", boundingBox, "All", children);
          } else {
            this.alignmentStart("widget", widget, "All");
          }
        } else {
          this.logger.error("startAligmentToolForWidget", "No widget with id", id);
        }
    },

    updateLines (box) {
      for (let id in this.model.lines) {
        const line = this.model.lines[id];
        if (line.to == box.id || line.from == box.id) {
          let from = this._dragNDropBoxPositions[line.from];
          if (!from) {
            from = this.getFromBox(line);
          }
          let to = this._dragNDropBoxPositions[line.to];
          if (!to) {
            to = this.getToBox(line); //this.model.screens[line.to];
          }
          this.updateLine(line, from, to);
        }
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

    isWidgetDNDCopy (e) {
      return e.altKey
    },

    onWidgetDndEnd (id, div, pos, dif, e) {
      this.logger.log(0, "onWidgetDndEnd", "enter > x:" + pos.x + " y:" + pos.y);
      const startPos = this._dragNDropBoxWidgetStart
      this.cleanUpAlignment();

      if (this.isWidgetDNDCopy(e)) {
          const correctedPOs = this.getCorrectedCopyPosition(pos)
          this._updateWidgetDND(id, startPos);
          if (this._selectWidget) {
            const copy = this.controller.onCopyWidget(id, correctedPOs);
            requestAnimationFrame( () => {
              this.onWidgetSelected(copy.id, true);
            })
          }
      
          if (this._selectMulti) {
            const copies = this.getController().onMultiCopyWidget(this._selectMulti, correctedPOs)
            requestAnimationFrame( () => {
              this.onMutliSelected(copies, true);
            })
          }

          if (this._selectGroup) {
            const group = this.getController().onCopyGroup(this._selectGroup, correctedPOs)
            requestAnimationFrame( () => {
              this.onGroupSelected(group.id, true);
            })
         
          }
          this.unSelect();
      } else {

          /**
           * In Select.js we should recalculate the bounding box.
           */
          if (this._dragNDropChildren) {
            const [positions, hasCopies] = this.getDnDEndPosittions(dif)
            const updatedPositions = this.getController().updateMultiWidgetPosition(positions, false, pos, hasCopies, id);
            this.updateZoomedPositionList(updatedPositions)
          } else {
            const widget = this.model.widgets[id];
            if (widget) {
              const sourcePos = this.getController().updateWidgetPosition(id, lang.clone(pos), false, this.isMasterWidget(widget));
              pos = this.updateZoomedPosition(widget, sourcePos)
            } else {
              this.logger.error("onWidgetDndEnd", "No widget with id >" + id);
              this.logger.sendError(new Error("No widget with id >" + id));
            }
          }
          this.onSelectionMoved(pos, dif, id);
      }

      this.cleanUpWidgetDnD();

      this.setState(0);
    },

    getDnDEndPosittions (dif) {
        const positions = {};
        let hasCopies = false;
        for (let i = 0; i < this._dragNDropChildren.length; i++) {
          const widgetID = this._dragNDropChildren[i];
          const widget = this.model.widgets[widgetID];
          if (widget) {
            const widgetPos = {
              x: dif.x + widget.x,
              y: dif.y + widget.y,
              h: widget.h,
              w: widget.w
            };
            positions[widgetID] = widgetPos;
            hasCopies = hasCopies || this.isMasterWidget(widget);
          } else {
            console.warn("No Widget", widgetID);
          }
        }
        return [positions, hasCopies]
    },

    updateZoomedPositionList (updatedPositions) {
      this.logger.log(1, "updateZoomedPositionList", "enter");
      for (let id in updatedPositions) {
        const sourcePos = updatedPositions[id]
        const zoomedPos = CoreUtil.getZoomedBoxCopy(sourcePos, this.getZoomFactor(), this.getZoomFactor());
        this.setWidgetPosition(id, sourcePos, zoomedPos);
      }
    },

    updateZoomedPosition (widget, sourcePos) {
      const zoomedPos = CoreUtil.getZoomedBoxCopy(sourcePos, this.getZoomFactor(), this.getZoomFactor());
      this.setWidgetPosition(widget.id, sourcePos, zoomedPos);
      return zoomedPos
    },


    /**
     * One of the most important methods! It handles the clicks
     * and the canvas depending on the current state / selection!
     *
     */
    onWidgetDndClick (id, div, pos, e) {
      this.logger.log(1, "onWidgetDndClick", "entry > " + id);

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
      if (e && e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
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

        /**
         * Since 2.1.3 we have sub groups
         */
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
        /**
         * Since 2.1.3
         */
        let group = this.getTopParentGroup(id);
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
      // console.debug('_addDnDChildren', id, this._dragNDropIgnoreGroup, this._dragNDropGroupChildren)
      if (this._dragNDropIgnoreGroup) {
        return;
      }

      /**
       * Since 2.1.3 we have sub groups. If the seletion is from the laylerList,
       * we just take the _dragNDropGroupChildren which must be passed the the
       * Select.seltGroup() method,
       */
      if (this._dragNDropGroupChildren) {
        if (this._dragNDropGroupChildren.indexOf(id) > -1) {
          this._dragNDropChildren = this._dragNDropGroupChildren;
        }
        return
      }

      /**
       * 1) check if there is a group we have to drag
       */
      if (!this._selectGroup) {
        /**
         * Since 2.1.3 we have subgroups!
         */
        let group = this.getTopParentGroup(id);
        if (group) {
          this._dragNDropChildren = group.children;
          this._addDNDChildrenCopies();
        }
      } else {
        /**
         * Since 2.1.3 we need also subgroups
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
      this.cleanUpKeyBoardListener()
      this.cleanUpDNDCopyPlaceHolder()
      if (this._resizeCursor) {
        css.remove(this.container, this._resizeCursor);
      }

      if (this._dndMoveDiv) {
        css.remove(this._dndMoveDiv, "MatcBoxMoving");
        delete this._dndMoveDiv;
      }
      delete this._dragNDropOffset;
      delete this._dragNDropBoxPositions;
      delete this._dragNDropChildren;
      delete this._dragNDropLineFromBox;
      delete this._dragNDropBoundingBox;
      delete this._dragNDropBoxWidgetStart;
    },

    cleanUpDNDCopyPlaceHolder () {
      if (this._alignmentTool && this._alignmentTool.setCopyReference) {
          this._alignmentTool.setCopyReference(null)
      }
      if (this._dragNDropCopyPlaceHolder) {
        const parent = this._dragNDropCopyPlaceHolder.parentNode
        if (parent) {
          parent.removeChild(this._dragNDropCopyPlaceHolder)
        }
      }
      delete this._dragNDropCopyPlaceHolder
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
      const line = this.model.lines[point.id];
      const p = line.points[point.i - 1];
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