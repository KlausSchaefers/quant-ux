<template>
  <div class="MatcWidgetDragNDrop">
    <div class="MatcInlineEditable MatcWidgetTypeLabelInlineEditable" ref="lblNode">
      </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import domGeom from "dojo/domGeom";
import domStyle from "dojo/domStyle";
import win from "dojo/_base/win";
import Logger from "common/Logger";
import UIWidget from "core/widgets/UIWidget";
import topic from 'dojo/topic'

export default {
  name: "DragNDrop",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      label: '',
      value: null,
      dndX: true,
      dndY: true
    };
  },
  components: {},
  methods: {
    postCreate () {
      this.log = new Logger("DragNDrop");
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._imageNodes = [this.domNode]
      this._labelNodes = [this.$refs.lblNode];
      this.log.log(4, "postrCreate", "enter");
    },

    wireEvents () {
      this.own(this.addTouchStart(this.domNode, lang.hitch(this, "onDndStart")));
      this.wireHover()
    },

    getLabelNode () {
      return this.$refs.lblNode;
    },

    onDndStart (e) {
      this.stopEvent(e);
      this.emitClick(e);
      this.cleanUp();
      this.initDnd();

      css.add(this.domNode, "MatcWidgetDragNDropMove");

      this.dndStartPos = this.getMouse(e);

      this.moveListener = this.addTouchMove(win.body(),lang.hitch(this, "onDnDMove"));
      this.releaseListener = this.addTouchRelease(win.body(),lang.hitch(this, "onDndEnd"));

      this.initCompositeState(this.value);

      if (this.model.active) {
        //this.emitAnimation(this.model.id, 0, this.model.active);
      }
    },

    initDnd () {
      if (!this.containerSize) {
        if (this.domNode.parentNode.parentNode) {
          this.containerSize = domGeom.position(
            this.domNode.parentNode.parentNode
          );
          this.log.log( 4,"onDndStart",  "enter " + this.containerSize.w + " " + this.containerSize.h);
        } else {
          console.warn("No container node!");
        }
      }
      if (!this.dndParentPos) {
        this.dndParentPos = this.getCanvasPosition(this.domNode.parentNode);
        this.log.log( 4, "onDndStart", "dom " + this.dndParentPos.x + "," + this.dndParentPos.y );
      }
    },

    onDnDMove (e) {
      this.stopEvent(e);
      const pos = this.getMouse(e);
      this.emitMouseMove(e, true);
      const delta = {
        x: 0,
        y: 0
      };
      if (this.dndX) {
        delta.x = Math.round(pos.x - this.dndStartPos.x);
      }
      if (this.dndY) {
        delta.y = Math.round(pos.y - this.dndStartPos.y);
      }
      this.dndCurrentDelta = delta;
  
      // Fixme: requestAnimationFrame works slow on android..
      this.renderPosition();
      this._lastAbsPos.event = e
      topic.publish('DragNDrop.Move', this._lastAbsPos)
    },

    renderPosition () {
      if (this.dndCurrentDelta) {
        this.updateValue(this.dndCurrentDelta);
        this.addCompositeSubState(this.value);
      }
      delete this.dndCurrentDelta;
    },

    onDndEnd (e) {
      this.stopEvent(e);
      this.emitCompositeState("dnd", this.value);
      this.cleanUp();
      this.dndParentPos = this._lastDndPositon;
      this._lastAbsPos.event = e
      topic.publish('DragNDrop.End', this._lastAbsPos)
    },

    updateValue (value) {
      if (this.containerSize) {
        /**
         * Do some bounds checking...
         */
        let x = this.dndParentPos.x + value.x;
        let y = this.dndParentPos.y + value.y;

        if (x + this.model.w > this.containerSize.w) {
          x = this.containerSize.w - this.model.w;
        }
        if (x < 0) {
          x = 0;
        }

        if (y + this.model.h > this.containerSize.h) {
          y = this.containerSize.h - this.model.h;
        }
        if (y < 0) {
          y = 0;
        }
        /**
         * save relative position
         */
        const newValue = {
          x: x / this.containerSize.w,
          y: y / this.containerSize.h
        };
        this.setValue(newValue);

        this._lastAbsPos = {x:x, y:y, w: this.model.w, h: this.model.h, z: this.model.z, id: this.model.id}
      
       
      } else {
        console.warn("No container Size");
      }
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
    setValue (value, retry = true) {
      if (value) {
        this.initDnd();
        this.value = value;

        if (this.containerSize) {
          if (!this.posReset) {
            if (this.dndX) {
              this.domNode.parentNode.style.left = "0";
            }
            if (this.dndY) {
              this.domNode.parentNode.style.top = "0";
            }
            this.posReset = true;
          }
          // transformOrigin = 0% 0%
          if (this.dndX && !this.dndY) {
            let trans = "translateX(" + value.x * this.containerSize.w + "px)";
            this.domNode.parentNode.style.transform = trans;
            this.domNode.parentNode.style.webkitTransform = trans;
          } else if (this.dndY && !this.dndX) {
            let trans = "translateY(" + value.y * this.containerSize.h + "px)";
            this.domNode.parentNode.style.transform = trans;
            this.domNode.parentNode.style.webkitTransform = trans;
          } else {
            let trans = "translate(" + value.x * this.containerSize.w + "px," + value.y * this.containerSize.h + "px)";
            this.domNode.parentNode.style.transform = trans;
            this.domNode.parentNode.style.webkitTransform = trans;
          }

          this._lastDndPositon = {
            x: value.x * this.containerSize.w,
            y: value.y * this.containerSize.h
          };
        } else {
          console.warn("setValue() > No container...");
          if (retry) {
            this.$nextTick(() => {
              this.setValue(value, false)
            })
          }
         
        }

        //this.domNode.parentNode.style.top = value.y*100 +"%";
        //this.domNode.parentNode.style.left = value.x*100 + "%";
      }
    },

    getState () {
      return {
        type: "pos",
        value: this.value
      };
    },

    setState (state, t) {

      if (state && state.type == "pos") {
        //this.setValue(state.value);
      }
      if (state && state.type == "dnd") {
        var substate = this.getLastSubState(state, t);
        if (substate) {
          var value = substate.value;
          this.setValue(value);
        }
      }
    },

    cleanUp () {
      if (this.moveListener) {
        this.moveListener.remove();
      }

      if (this.releaseListener) {
        this.releaseListener.remove();
      }

      delete this.moveListener;
      delete this.releaseListener;
      delete this.dndStartPos;
      css.remove(this.domNode, "MatcWidgetDragNDropMove");

      if (this.model.active) {
        //this.emitAnimation(this.model.id, 0, this.model.style);
      }
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;

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

    getCanvasPosition: function(node) {
      var s = domStyle.get(node);
      return {
        x: this.removePx(s.left),
        y: this.removePx(s.top)
      };
    },

    removePx: function(v) {
      var pos = v.indexOf("px");
      if (pos >= 0) {
        v = v.substring(0, pos);
      }
      return v * 1;
    },

    beforeDestroy: function() {
      if (this._compositeState) {
        this.emitCompositeState();
      }
      this.cleanUp();
    }
  },
  mounted() {}
};
</script>