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

    onScreenDndStart (id, div, pos) {
      this.logger.log(3, "onScreenDndStart", "entry");
      this.beforeDND();
      this._dragNDropBoxPositions = {};


      this._resizeCursor = "MatcCanvasScreenDND";
      css.add(this.container, this._resizeCursor);

      const screen = this.model.screens[id];
      this._addDNGroups(screen?.children, pos)

      return screen;
    },

    onScreenDndMove (id, div, pos, dif) {
      topic.publish("matc/canvas/click", "", "");
      this.setState(1);
      this.cleanUpDebugLines();
      

      if (!this._alignmentToolInited) {

        /**
         * Check only on move if we have to change the selection
         */
        if (this._canvasSelection.screens.length === 0) {
          this.setSelectedScreens([id], false, false)
        } else if (this._canvasSelection.screens.findIndex(scrn => scrn.id === id) < 0) {
          this.setSelectedScreens([id], false, false)
        }


        const screenIDs = this._canvasSelection.screens.map(s => s.id)
        const screen = this.model.screens[id];
        this.alignmentStart("screen", screen, "All", screenIDs);
      }

  		this._canvasSelection.screens.forEach(scrn => {
        this.renderScreenDND(scrn.id, pos, dif)
      })

      
      return true;
    },

    renderScreenDND(id, pos, dif) {
      const screen = this.model.screens[id];

      const temp = { 
        x: screen.x + dif.x, 
        y: screen.y + dif.y, 
        h: screen.h, 
        w: screen.w 
      };

      if (this.isInContainer(temp)) {
        this._dragNDropBoxPositions[id] = temp;

        /**
         * update also the background screen & grid
         */
        const zoomedPos = this.getBackgroundPos(temp, this.zoom, this.zoom);
        const backgroundDiv = this.screenBackgroundDivs[id];
        const job = {
          zoom: true,
          div: backgroundDiv,
          pos: zoomedPos,
          id: id + "backGround"
        };
        this.addDragNDropRenderJob(job);

        const gridDiv = this.screenGridDivs[id];
        const job2 = {
          zoom: true,
          div: gridDiv,
          pos: zoomedPos,
          id: id + "grid"
        };
        this.addDragNDropRenderJob(job2);

        const dndDiv = this.screenDivs[id];
        const job3 = {
          zoom: false,
          div: dndDiv,
          pos: temp,
          id: id + "DND"
        };
        this.addDragNDropRenderJob(job3);

        /**
         * Also update resize handlers. The _DragNDrop._dragNDropUpDateUI()
         * method will perform the updaze  *IF AND ONLY IFF*
         * this if if the moved widget(s) matches the one of the
         * resizeHnalder.
         */
        if (this._resizeHandlerBox) {
          const resizePos = {
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
        //this.updateCommentPosition(id, temp);

        /**
         * also update all contained widgets
         */
        this.updateChildren(screen, pos, dif);

        /**
         * also update all lines
         */
        this.updateLines(screen);

        this.updateGroupLines(pos)

        return true;
      }
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

    onScreenDndEnd (id, div, pos) {
      this.logger.log(3, "onScreenDndEnd", "enter > x:" + pos.x + " y:" + pos.y);

      if (this._resizeCursor) {
        css.remove(this.container, this._resizeCursor);
      }
      this.cleanUpAlignment();
      this.cleanUpScreenDnD();

      const screenIDs = this._canvasSelection.screens.map(s => s.id)

      if (screenIDs.length === 1) {
        this.getController().updateScreenPosition(id, lang.clone(pos), true);
      } else {
        this.getController().updateMultiScreenPosition(id, lang.clone(pos), screenIDs);
      }


      this._dragNDropBoxPositions = null;  
      // we do not need to render, because the model change will trigger
      // a rerender
      this.setSelectedScreens(screenIDs, false, false);
      this.setState(0);
    },

    cleanUpScreenDnD () {
      delete this._dragNDropLineGroups
    },

    onScreenDndClick (id, div, pos, e) {
      this.logger.log(-2, "onScreenDndClick", "entry > " + id);

      if (this._boxClickCallback) {
        this.dispatchBoxClickCallback(id, div, pos, e);
        return;
      }

      this.setSelectedScreens([id], e.shiftKey);
      this.setState(0);
    },

    /**********************************************************************
     * Widget DnD
     **********************************************************************/

    onWidgetDndStart (id, div, pos, e) {
      this.logger.log(1, "onWidgetDndStart", "entry > " + id);

      // FIXME: First thing we should do, is to check if the selection has changed.

      const ids = this.getSelectedIds();
      if (ids == null) {
        this.setDnDMinTime(0);
      }

      this._dragNDropBoxPositions = {};
      this._dragNDropBoxWidgetStart = pos;

      /**
       * make sure inline edit is flushed
       */
      this.inlineEditStop();

      /**
       * Now add all elements
       */
      this._addDnDChildren(id,ids, pos);
      this._addDNGroups(this._dragNDropChildren, pos)
      this._addDDNOffset(pos)
     
      if (this.widgetDivs[id]) {
        this._dndMoveDiv = this.widgetDivs[id];
        css.add(this._dndMoveDiv, "MatcBoxMoving");
      }
      this._resizeCursor = "MatcCanvasResizeCursorAll";
      css.add(this.container, this._resizeCursor);

      if (e.ctrlKey) {
        this.stopEvent(e);
      }

      // we register here a keybaord listeners, so pressing SHIFT
      // or OPTION will triggers the onWidetMove
      this.registerKeyBoardListener(e => this.onWidgetDNDKeyDown(e))
      const widget = this.model.widgets[id];
      return widget;
    },

    _addDDNOffset(pos) {
      /** 
       * For STRG copy we need the offset to make the alignment work correctly
       */
      if (this._dragNDropChildren) {
        const dragNDropBoundingBox = this.getBoundingBox(this._dragNDropChildren);
        this._dragNDropOffset = {
          x: dragNDropBoundingBox.x - pos.x,
          y: dragNDropBoundingBox.y - pos.y
        }
      }
    },

    _addDNGroups (ids, pos) {
      if (!ids) {
        return
      }
      const lookupLines = {}
      for (let id in this.model.lines) {
        const line = this.model.lines[id]
        lookupLines[line.from] = line
      }
      ids.forEach(id => {
        /** FIXME: This could does not work for vertain multi selections */
        const parentGroup = this.getParentGroup(id)
        if (parentGroup && lookupLines[parentGroup.id]) {
          this._addDNGroup(parentGroup, pos)
        }
      })
    },

    _addDNGroup (group, pos) {
      if (!this._dragNDropLineGroups) {
        this._dragNDropLineGroups = {}
      }
      const boundingBox = this.getBoundingBox(group.children);
      this._dragNDropLineGroups[group.id] = {
        group: group,
        boundingBox: boundingBox,
        offSet: {
          x: boundingBox.x - pos.x,
          y: boundingBox.y - pos.y
        }
      }     
    },

    _addDnDChildren(id, ids, pos) {
      //console.debug('addChildren', ids, id, ids?.indexOf(id) === -1)
      const topGroup = this.getTopParentGroup(id)
      const selectedGroup = this.getSelectedGroup()
      const selectedMulti = this.getMultiSelection()
      /**
       * We can have here the situation, that a new element is selected
       * when a DND operation is iniated. For instance group A is selected
       * but widget B is moved.
       */
      if (!ids || ids.indexOf(id) === -1) {
        this.logger.log(1, "_addDnDChildren", "exit > Change : " + id, topGroup);
        /**
         * If there is a top group, we add it's children
         */
        if (topGroup) {
          const allChildren = this.getAllGroupChildren(topGroup)
          this._dragNDropChildren = allChildren
          this._addDNGroup(topGroup, pos)
        }
        return
      }
    
      if (selectedMulti) {
        if (selectedMulti.indexOf(id) > -1) {
          this.logger.log(1, "_addDnDChildren", "exit > Multi : " + selectedMulti);
          this._dragNDropChildren = selectedMulti;
        }
        return
      }

      if (selectedGroup) {
        this.logger.log(1, "_addDnDChildren", "exit > Group : " + selectedGroup);
        const allChildren = this.getAllGroupChildren(selectedGroup)
        this._dragNDropChildren = allChildren
        this._addDNGroup(selectedGroup, pos)
        return
      }
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
        this._updateWidgetBackground(id, temp);
        this.updateChildren(widget, temp, dif);       
        this.updateResizeHandlerBox(dif)
        this.updateGroupLines(pos)
        this.updateLines(widget);        
    },

    updateResizeHandlerBox(dif) {
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
    },

    updateGroupLines (pos) {
         /**
         * Since 4.4.0 we update also group lines
         */
         if (this._dragNDropLineGroups) {
          for (let groupId in this._dragNDropLineGroups) {
            const groupPos = this._dragNDropLineGroups[groupId]
            const temp2 = {
              x: pos.x + groupPos.offSet.x,
              y: pos.y + groupPos.offSet.y,
              h: groupPos.boundingBox.h,
              w: groupPos.boundingBox.w,
            };
            this._dragNDropBoxPositions[groupId] = temp2;
            this.updateLines(groupPos.group);
          }
        }
    },

    updateAllLines () {
      if (this.renderLines){
        const zoomedModel = this.model
				for (let id in zoomedModel.lines){
					const line = zoomedModel.lines[id];
					if (!line.hidden){
						this.renderLine(zoomedModel.lines[id]);
					}
				}
			}
    },

    startAligmentToolForWidget(id) {
        /**
         * setup alignment tool. In case of multi or group use bounding
         * box, but if the group child was explicitly selected (second click)
         * just use the widget
         */
        const widget = this.model.widgets[id];
        const selectedMutli = this.getMultiSelection()
        if (widget) {
          const group = this.getParentGroup(id);
          // We only want to move the bounding box, if the moving widgets
          // as acutually part of the selection!
          if (selectedMutli && selectedMutli.indexOf(id) >= 0) {
            const boundingBox = this.getBoundingBox(selectedMutli);
            boundingBox.id = id;
            this.alignmentStart("boundingbox", boundingBox, "All", selectedMutli);
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
      /** This could be faster. The lookup could be cached */
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
          if (this.getSelectedWidget()) {
            const copy = this.controller.onCopyWidget(id, correctedPOs);
            requestAnimationFrame( () => {
              this.onWidgetSelected(copy.id, true);
            })
          }
      
          if (this.getMultiSelection()) {
            const copies = this.getController().onMultiCopyWidget(
                this.getMultiSelection(), 
                correctedPOs
            )
            requestAnimationFrame( () => {
              this.onMutliSelected(copies, true);
            })
          }

          if (this.getSelectedGroup()) {
            const group = this.getController().onCopyGroup(this.getSelectedGroup(), correctedPOs)
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
              if (sourcePos) {
                pos = this.updateZoomedPosition(widget, sourcePos)
              } else {
                this.logger.error("onWidgetDndEnd", "No sourcePos for "+ id);
                this.logger.sendError(new Error("No sourcePos with id >" + id));
              }

            } else {
              this.logger.error("onWidgetDndEnd", "No widget with id >" + id);
              this.logger.sendError(new Error("No widget with id >" + id));
            }
          }
 
          if (!this.isInSelection(id)) {
            this.setSelectionById(id)
          } else {
            this.onSelectionMoved(pos, dif, id);
            /**
             * Since 4.4.0 we also update lines
             */
            this.updateAllLines()
          }       
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
        this._expandSelectionById(id)
      } else {
        this.setSelectionById(id)
      }

      this.cleanUpWidgetDnD();
      this.setState(0);
    },

    _expandSelectionById (id) {
        
        /**
         * FIXME: This is an evil bug! This open in FireFox an popup!
         * Maybe we have to listen to RMC and stop it..
         */
        let selectedMulti = this.getMultiSelection()
        const selectedWidget = this.getSelectedWidget()
        if (!selectedMulti) {
          selectedMulti = []
          this.setMultiSelection(selectedMulti)
        }

        /**
         * Expand exiting selections
         */
        if (this.getSelectedGroup()) {
          this.setMultiSelection(selectedMulti.concat(this.getSelectedGroup().children))  
        }

        if (selectedWidget) {
          this.setMultiSelection([selectedWidget.id])  
        }

        /**
         * Since 2.1.3 we have sub groups
         */
        let group = this.getTopParentGroup(id);
        if (group) {
          this.setMultiSelection(selectedMulti.concat(group.children))  
        } else {
          if (this.getMultiSelection().indexOf(id) < 0) {
            this.setMultiSelection([id], true) 
          } else {
            /**
             * FIXME: remove from selected...
             */
          }
        }
      
        this.onMutliSelected(this.getMultiSelection());
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
      delete this._dragNDropBoxWidgetStart;
      delete this._dragNDropLineGroups
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
      const line = this.model.lines[point.id];
      const from = this.getFromBox(line);
      const to = this.getToBox(line);
      const supportedLine = this.layoutAddSupportPoints(from, to, line);
      supportedLine[point.i].x = pos.x;
      supportedLine[point.i].y = pos.y;

      this.layoutCorrectAnchorPoints(supportedLine);
      const layoutedLine = this.layoutCorrectArrow(supportedLine);

      const job = {
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