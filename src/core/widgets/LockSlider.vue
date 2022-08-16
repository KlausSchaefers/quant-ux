
<template>
  <div :class="['MatcWidgetTypeLockSlider', {'MatcWidgetTypeLockSliderMoving': dndIsStarted} ]">
    <div class="MatcWidgetTypeLockSliderLabel" ref="label">{{label}}</div>
    <div class="MatcWidgetTypeLockSliderCntr" ref="cntr">
        <div class="MatcWidgetTypeLockSliderBar" ref="bar">
            <div class="MatcWidgetTypeLockSliderWrapper" ref="wrapper">
                <div class="MatcWidgetTypeLockSliderForeground" ref="foreground">
                </div>
                <div class="MatcWidgetTypeLockSliderHandle" ref="handle">
                    <span :class="'MatcWidgetTypeLockSliderIcon ' + icon" ref="icon"/>
                </div>
            </div>
        </div>
     </div>
  
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";
import domGeom from "dojo/domGeom";
import win from "dojo/_base/win";

export default {
  name: "LockSlider",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false,
      model: false,
      dndIsStarted: false
    };
  },
  components: {},
  computed: {
     label () {
          if (this.model && this.model.props && this.model.props.label) {
              return this.model.props.label
          }
          return ''
      }, 
     icon () {
        if (this.model && this.model.style && this.model.style.icon) {
              return this.model.style.icon
        }
        return ''
      }
  },
  methods: {
    postCreate () {
      const handle = this.$refs.handle
      const label = this.$refs.label
      this._labelNodes = [label];
      this._borderNodes = [this.domNode, handle];
      this._shadowNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
    },

    wireEvents () {
      this.wired = true;
      const handle = this.$refs.handle
       this.own(
        this.addTouchStart(handle, lang.hitch(this, "onDndStart"))
      );
      this.wireHover()
    },

    onDndStart (e) {
        this.stopEvent(e);
        this.cleanUpDnd();
        this.dndIsStarted = true
        this.dndCntrPos = domGeom.position(this.$refs.wrapper)
        this.dndStartPos = this.getMouse(e);
        this.moveListener = this.addTouchMove(win.body(),lang.hitch(this, "onDnDMove"));
        this.releaseListener = this.addTouchRelease(win.body(),lang.hitch(this, "onDnDUp"));
        this.initCompositeState()
    },


    onDnDMove(e) {
        this.stopEvent(e);
        var pos = this.getMouse(e);
        let difX = pos.x - this.dndStartPos.x
        let p = Math.min(Math.max(0, difX / this.dndCntrPos.w), 1) * 100
        //let p = (pos.x - this.dndCntrPos.x)/ this.dndCntrPos.w
        //console.debug(this.dndCntrPos.x, pos.x, pos.x - this.dndCntrPos.x , this.dndCntrPos.w)
        //p = Math.min(Math.max(0, p), 1) * 100
        this.dndnLastP = p
        this.setPosition(p)
        this.emitMouseMove(e, true);
        this.addCompositeSubState(p)
    },

    onDnDUp (e) {
        if (this.dndnLastP < 80) {
            this.addCompositeSubState(0);
            this.emitCompositeState("dnd", 0);
            this.setValue(false)
        } else {
            this.addCompositeSubState(100);
            this.emitCompositeState("dnd", 100);
            this.setValue(true)
            setTimeout(() => {
                this.emitClick(e);
            }, 500)
        }
        this.onDndEnd(e)
    },

    onDndEnd (e) {
 
        this.stopEvent(e);
        this.cleanUpDnd();
    },

    cleanUpDnd () {
        if (this.moveListener) {
         this.moveListener.remove();
        }

        if (this.releaseListener) {
            this.releaseListener.remove();
        }

        delete this.moveListener;
        delete this.releaseListener;
        delete this.dndStartPos;
        delete this.dndCntrPos
        delete this.dndnLastP
        this.dndIsStarted = false
    },


    getLabelNode() {
      return this.$refs.label;
    },

    render (model, style, scaleX, scaleY) {
        this.model = model;
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this.resize(model)
        this.setStyle(style, model);
        this.setWrapper(style)
        this.setHandle(style)
        this.setForeground(style)
        this.setCntr(style)
        this.setValue(false)
    },

    resize (box) {
        let h = box.h;
        if (this.style.paddingTop) {
            h -=  this.getZoomed(this.style.paddingTop, this._scaleY)
        }
        if (this.style.paddingBottom) {
            h -=  this.getZoomed(this.style.paddingBottom, this._scaleY)
        }
        if (this.style.borderTopWidth) {
            h -=  this.getZoomed(this.style.borderTopWidth, this._scaleY)
        }
         if (this.style.borderBottomWidth) {
            h -=  this.getZoomed(this.style.borderTopWidth, this._scaleY)
        }  
 
        let w = box.w
        if (this.style.paddingLeft) {
            w -= this.getZoomed(this.style.paddingLeft, this._scaleY)
        }
         if (this.style.paddingRight) {
            w -= this.getZoomed(this.style.paddingRight, this._scaleY)
        }
         if (this.style.borderRightWidth) {
            w -= this.getZoomed(this.style.borderRightWidth, this._scaleY)
        }
         if (this.style.borderLeftWidth) {
            w -= this.getZoomed(this.style.borderLeftWidth, this._scaleY)
        }  
        const icon = this.$refs.icon
        icon.style.fontSize = Math.round(h * 0.6) + "px";

        const handle = this.$refs.handle
        handle.style.height = h + "px";
        handle.style.width = h + "px";
        handle.style.right = h/-2 + 'px'

        const bar = this.$refs.bar
        bar.style.width = Math.round(w - h) + 'px'
      
        const foreground = this.$refs.foreground
        foreground.style.right = h/-2 + 'px'
        foreground.style.width = (w) + 'px'
    },

    setHandle (style) {
        const icon = this.$refs.icon
        if (style.iconColor) {
            icon.style.color = style.iconColor  
        } else {
            icon.style.color = style.color
        }
    
        const handle = this.$refs.handle
        if (style.handleColor) {
            handle.style.background = style.handleColor
        } else {
            handle.style.background = style.background
        }
    },

    setForeground(style) {
        const foreground = this.$refs.foreground
        if (style.foregroundColor) {
            foreground.style.background = style.foregroundColor
        } else {
            foreground.style.background = style.background
        }
        
        this.setRadius(foreground, style)
    },

    setWrapper(style) {
        const wrapper = this.$refs.wrapper
        this.setRadius(wrapper, style)
    },

    setCntr (style) {
        const cntr = this.$refs.cntr
        this.setRadius(cntr, style)
    },

    setRadius (node, style) {
        node.style.borderTopRightRadius = this.getZoomed(style.borderTopRightRadius, this._scaleY) + 'px';
        node.style.borderTopLeftRadius = this.getZoomed(style.borderTopLeftRadius, this._scaleY) + 'px';
        node.style.borderBottomRightRadius = this.getZoomed(style.borderBottomRightRadius, this._scaleY) + 'px';
        node.style.borderBottomLeftRadius = this.getZoomed(style.borderBottomLeftRadius, this._scaleY) + 'px';
    },

    setPosition (p) {
        p -= 100
        const wrapper = this.$refs.wrapper
        wrapper.style.transform = `translateX(${p}%)`
        this.handlePosition = p
    },

    _set_handleShadow (parent, style) {
        if (style.handleShadow) {
            const handleShadow = style.handleShadow
            const handle = this.$refs.handle
            this._setShadow(handle, handleShadow)
        }  
    },

    onSelect (option, e) {
      this.stopEvent(e);
      let value = option
      this.value = value;
      this.emitDataBinding(value);
      this.setValue(value);
      this.emitStateChange("select", value, e);
    },

    onHandleClick (e) {
        this.stopEvent(e);
        this.setValue(!this.value)
        this.emitDataBinding(this.value);
   
    },


    getValue () {
      return this.value;
    },

    setValue (value) {
      this.value = value;
      if (!value) {
        this.setPosition(0)
      } else {
        this.setPosition(100)
      }
    },

    getState () {
      return {
        type: "select",
        value: this.value
      };
    },

    setState (state, t) {
      if (state) {
        if (state.type == "select") {
          this.setValue(state.value);
        }
        if (state && state.type == "dnd") {
            const substate = this.getLastSubState(state, t);
            if (substate) {
                const p = substate.value;
                this.setPosition(p);
            }
        }
      }
    },

    beforeDestroy: function() {
    }
  },
  mounted() {
  }
};
</script>