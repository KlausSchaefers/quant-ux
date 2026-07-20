<template>
  <div class="MatcWidgetTypeChat">

      <div class="MatcWidgetTypeChatInputCntr" ref="inputCntr" >
        <textarea v-if="mode === 'simulator'" class="MatcWidgetTypeChatInput" v-model="value" ref="input" :placeholder="placeholder"
        ></textarea>
        <div v-else  class="MatcWidgetTypeChatInput " ref="input">
          <div class="MatcWidgetTypeChatInputPlaceholder" ref="placeHolder">
            {{ placeholder }}
          </div>
        </div>
        <div class="MatcWidgetTypeChatInputButton" ref="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M18 11l-6 -6" /><path d="M6 11l6 -6" /></svg>
        </div>
      </div>
      <!-- <div class="MatcWidgetTypeChatFooter">
        + 
      </div>
    -->
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import Logger from "common/Logger";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from "common/DomBuilder";

export default {
  name: "ChatTextBox",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: '',
      model: false,
      mode: "edit",
      hasFocus: false
    };
  },
  components: {},
  computed: {
    isInputVisible () {
      if (this.model && this.model.style && this.model.style) {
        return this.model.style.inputHeight > 0;
      }
      return true
    },
    placeholder() {
      if (this.model && this.model.props && this.model.props.label) {
        return this.model.props.label;
      }
      return "";
    },
    isCentered () {
      if (this.model && this.model.props && this.model.props.centerWhenEmpty) {
        return false
      }
      if (this.model && this.model.props && this.model.props.value) {
        return this.model.props.value.length === 0;
      }
      return false
    }
  },
  methods: {
    postCreate() {
      this.log = new Logger("Chat");
      this.db = new DomBuilder();
     
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
    },

    
    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.setValue(model.props.value);
      this.setStyle(style, model);


      this.$refs.button.style.background = style.messageButtonBackground;
      this.$refs.button.style.color = style.messageButtonColor;
      this.$refs.button.style.borderRadius = this.getZoomed(style.borderTopRightRadius ? style.borderTopRightRadius : 0, this._scaleX) + "px";

 
    },

    getLabelNode () {
      return this.$refs.placeHolder;
    },
   
    setValue(value) {
      this.value = value;
    },
   

    capitalize(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    },

    wireEvents() {
      if (!this.wired) {
        this.wireHover();
        if (this.mode == "simulator") {
          const input = this.$refs.input;
          this.own(on(input, "keydown", lang.hitch(this, "onKeyDown")));
          this.own(on(input, "focus", lang.hitch(this, "onFocus")));
          this.own(on(input, "blur", lang.hitch(this, "onBlur")));
          this.own(this.addClickListener(this.$refs.button, lang.hitch(this, "onSendClick")));
        }
      }
      this.wired = true;
    },

    /**
     * Apply the "focus" style from the JSON while the input has focus,
     * and revert to the default style on blur.
     */
    onFocus(e) {
      this.stopPropagation(e);
      this.hasFocus = true;
      if (this.model.focus) {
        this.emitAnimation(this.model.id, 200, this.model.focus);
      }

    },

    onBlur(e) {
      this.stopPropagation(e);
      this.hasFocus = false;
      if (this.model.focus) {
        this.emitAnimation(this.model.id, 200, this.model.style);
      }
    },

    /**
     * Apply the "hover" style, but not while the input is focused so we
     * don't override the focus style.
     */
    onDomMouseOver(e) {
      if (this.hasFocus) {
        return;
      }
      if (this.model.hover) {
        this.emitAnimation(this.model.id, this.hoverAnimationDuration, this.model.hover);
      }
      this.emitMouseOver(e);
    },

    onDomMouseOut(e) {
      if (this.hasFocus) {
        return;
      }
      if (this.model.hover) {
        this.emitAnimation(this.model.id, this.hoverAnimationDuration, this.model.style);
      }
      this.emitMouseOut(e);
    },

    onKeyDown(e) {
      const key = e.which || e.keyCode;
      if (key == 13 && !e.shiftKey) {
        this.stopEvent(e);
        this.onEnterPressed();
      }
    },

    onSendClick(e) {
      this.stopEvent(e);
      this.onEnterPressed();
    },

    onEnterPressed() {
      const input = this.$refs.input;
      const txt = input.value;
      this.setValue(txt)
      this.emitStateChange("value", this.value, null, false);
      this.emitDataBinding(this.value);
    },


    getValue() {
      return this.value;
    },

    getState() {
      return {
        type: "value",
        value: this.value
      };
    },

    setState(state) {
      if (state && state.type == "value") {
        this.setValue(state.value);
      }
    },

    _setDataBindingValue(v) {
      console.debug('_setDataBindingValue', v)
      this.setValue(v);
    }
  },
  mounted() {},
  beforeDestroy() {  
  }
};
</script>
