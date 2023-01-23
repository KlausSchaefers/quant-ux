<template>
    <div class="MatcWidgetDragNDropTarget">
      <div class="MatcInlineEditable MatcWidgetTypeLabelInlineEditable" ref="lblNode">
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
      },
  
      wireEvents () {
        //this.wireHover()
        this._moveListener = topic.on('DragNDrop.Move', (e) => {this.onDNDMove(e)})
        this._endListener = topic.on('DragNDrop.End', (e) => {this.onDNDEnd(e)})
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

      onDNDEnd (other) {
        if (this.isInside(other)) {
          this.emitClick(other.event)
        }
      },

      isInside (obj) {
        const parent = this.modelPosition
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
       
      },
  
      cleanUp () {
        if (this.model.active) {
          //this.emitAnimation(this.model.id, 0, this.model.style);
        }
      },
  
      render (model, style, scaleX, scaleY) {
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
        if (this._compositeState) {
          this.emitCompositeState();
        }
        if (this._moveListener) {
          this._moveListener.remove()
        }
        if (this._endListener) {
          this._endListener.remove()
        }
      }
    },
    mounted() {}
  };
  </script>