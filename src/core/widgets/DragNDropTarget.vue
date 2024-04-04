<template>
    <div class="MatcWidgetDragNDropTarget">
      <div class="MatcInlineEditable MatcWidgetTypeLabelInlineEditable" ref="lblNode" v-if="!hasChildren">
        {{label}}
      </div>
    </div>
  </template>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import domStyle from "dojo/domStyle";
  import Logger from "common/Logger";
  import UIWidget from "core/widgets/UIWidget";
  import topic from 'dojo/topic'
  import CoreUtil from 'core/CoreUtil'
  //import domGeom from "dojo/domGeom";
  
  export default {
    name: "DragNDropTarget",
    mixins: [UIWidget, DojoWidget],
    data: function() {
      return {
        value: null,
        hasChildren: false,
        label:''
      };
    },
    components: {},
    methods: {
      postCreate () {
        this.log = new Logger("DragNDropTarget");
        this._borderNodes = [this.domNode];
        this._backgroundNodes = [this.domNode];
        this._shadowNodes = [this.domNode];
        this._paddingNodes = [this.domNode];
        this._labelNodes = [this.$refs.lblNode];
        this._imageNodes = [this.domNode]
        this.childrenDNDWidgets = []
      },
  
      wireEvents () {
        this._moveListener = topic.on('DragNDrop.Move', (e) => {this.onDNDMove(e)})
        this._endListener = topic.on('DragNDrop.End', (e) => {this.onDNDEnd(e, true)})
        this._initListener = topic.on('DragNDrop.Init', (e) => {this.onDNDEnd(e, false)})
      },
  
      getLabelNode () {
        return this.$refs.lblNode;
      },

      onDNDMove (other) {
        if (this.isInside(other)) {
          if (this.model.hover) {
            this.emitAnimation(
              this.model.id,
              this.hoverAnimationDuration,
              this.model.hover
            );
          }
          this.emitMouseOver(other.event)
        } else {
          this.emitAnimation(
            this.model.id,
            this.hoverAnimationDuration,
            this.model.style
          );
        }
      },

      onDNDEnd (other, animate = true) {
        if (this.isInside(other)) {
          this.snapChildren(other, animate)
          if (animate) {
            this.emitClick(other.event)
          }
        } else {
          this.removeChildDND(other)
          this.repositonChildren(animate)
        }
        this.hasChildren = this.childrenDNDWidgets.length > 0
        this.emitAnimation(
          this.model.id,
          this.hoverAnimationDuration,
          this.model.style
        );
      },

      removeChildDND (child) {
        this.childrenDNDWidgets = this.childrenDNDWidgets.filter(n => n.id !== child.id)
      },

      snapChildren (other, animate = true) {
        const layout = this.model.props.layout
        if ('grid' !== layout && 'rows' !== layout && 'columns' !== layout){
          return
        }
        this.insertChildAtPosition(other)
        this.repositonChildren(animate)
      },

      repositonChildren (animate=true) {
        const layout = this.model.props.layout
        const style = this.model.style
        const paddingTop = this.getZoomed(style.paddingTop, this._scaleY)
        const paddingBottom = this.getZoomed(style.paddingBottom, this._scaleY)
        const paddingLeft = this.getZoomed(style.paddingLeft, this._scaleY)
        const paddingRight = this.getZoomed(style.paddingRight, this._scaleY)
        const gap = this.getZoomed(style.gap, this._scaleY)

        const height = this.modelPosition.h  - paddingBottom - paddingTop
        const width = this.modelPosition.w - paddingLeft - paddingRight

        const maxChildWidth = 'rows' === layout ?
          width :
          Math.max(...this.childrenDNDWidgets.map(n => n.w))
       
        const maxChildHeight = 'columns' === layout? 
          height :
          Math.max(...this.childrenDNDWidgets.map(n => n.h))


        const columns = Math.floor(width / (maxChildWidth))
        const rows = Math.floor(height/ (maxChildHeight))
        const offsetX = this.modelPosition.x + paddingLeft
        const offsetY = this.modelPosition.y + paddingTop
        for (let r=0; r < rows; r++) {
          for (let c=0; c < columns; c++) {
            const p = r * columns + c
            const node = this.childrenDNDWidgets[p]
            if (node) {
              node.x = offsetX + (c * (maxChildWidth + gap))
              node.y = offsetY + (r * (maxChildHeight + gap))
              topic.publish('DragNDrop.Reposition.' + node.id, {id: node.id, absPos: node, animate:animate })
            }
          }
        }
       
        this.emitHiddenStateChange('value', this.childrenDNDWidgets.map(n => n.value))
        
      },

      insertChildAtPosition (other) {
        const beforeIndex = this.getBeforeIndex(other)
        if (beforeIndex === -1) {
          this.childrenDNDWidgets = this.childrenDNDWidgets.filter(n => n.id !== other.id)
          this.childrenDNDWidgets.push(other)
        } else {
          this.childrenDNDWidgets = this.childrenDNDWidgets.filter(n => n.id !== other.id)
          this.childrenDNDWidgets.splice(beforeIndex, 0, other);
        }
        return beforeIndex
      },

      getBeforeIndex (other) {
          if ('rows' === this.model.props.layout) {
            return this.childrenDNDWidgets.findIndex(n => (n.y + n.h > other.y))
          }
          if ('columns' === this.model.props.layout) {
            return this.childrenDNDWidgets.findIndex(n => (n.x + n.w > other.x))
          }
          return this.childrenDNDWidgets.findIndex(n => (n.y + n.h > other.y) && (n.x + n.w > other.x))
      },
      
      isInside (obj, half = true) {
        const parent = this.modelPosition
        if (half) {
          obj = {
            x: obj.x + obj.w / 2,
            y: obj.y + obj.h / 2,
            w: 1,
            h: 1,
            z: obj.z
          }
        }
        if (parent) {
            if (obj.x >= parent.x && obj.x + obj.w <= parent.w + parent.x && (obj.y >= parent.y && obj.y + obj.h <= parent.y + parent.h)) {
                return obj.z >= this.model.z;
            }
          }
          return false;
      },
      
      setZoomedModel (m) {
        this.zoomedModel = m
      },
  
      /**
       * returns the current position
       */
      getValue () {
        return this.value;
      },
  
      /**
       * set the current position
       */
      setValue () {
      },
  
      getState () {
        return {
        }
      },
  
      setState () {

        // if (state && state.type === 'childPositions') {
        //   const children = state.value
        //   children.forEach(c => {

        //   })
        // }
       
      },
  
      cleanUp () {
        if (this.model.active) {
          //this.emitAnimation(this.model.id, 0, this.model.style);
        }
      },
  
      render (model, style, scaleX, scaleY) {
        this.childrenDNDWidgets = []
        this.model = model;
        this.modelPosition = CoreUtil.getWidgetPostionInScreen(model, this.zoomedModel)
     
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this.setStyle(style, model);
        if (model.props.label) {
          this.label = model.props.label;
        }
        this.setInnerHTML(this.$refs.lblNode, this.label);
  
        if (this.model.props) {
          this.dndX = this.model.props.dndX;
          this.dndY = this.model.props.dndY;
        }
      },

    
  
      getCanvasPosition (node) {
        const s = domStyle.get(node);
        return {
          x: this.removePx(s.left),
          y: this.removePx(s.top)
        };
      },
  
      removePx (v) {
        const pos = v.indexOf("px");
        if (pos >= 0) {
          v = v.substring(0, pos);
        }
        return v * 1;
      },
  
      beforeDestroy () {
        if (this._moveListener) {
          this._moveListener.remove()
        }
        if (this._endListener) {
          this._endListener.remove()
        }
        if (this._initListener) {
          this._initListener.remove()
        }
      }
    },
    mounted() {}
  };
  </script>