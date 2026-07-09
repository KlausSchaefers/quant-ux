<template>
  <div class="MatcWidgetTypeChat">
    <div :class="['MatcWidgetTypeChatCntr', {'MatcWidgetTypeChatCntrCenter': isCentered} ]" ref="cntr">
      <div class="MatcWidgetTypeChatMessages" ref="messages"></div>
      <div class="MatcWidgetTypeChatInputCntr" ref="inputCntr">
        <textarea
          v-if="mode === 'simulator'"
          class="MatcWidgetTypeChatInput"
          ref="input"
          :placeholder="placeholder"
        ></textarea>
        <div
          v-else
          class="MatcWidgetTypeChatInput "
          ref="input"
        >
          <div class="MatcWidgetTypeChatInputPlaceholder" ref="placeHolder">
            {{ placeholder }}
          </div>
        </div>
        <div class="MatcWidgetTypeChatInputButton" ref="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M18 11l-6 -6" /><path d="M6 11l6 -6" /></svg>
        </div>
      </div>
    </div>
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
  name: "Chat",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: [],
      model: false,
      mode: "edit",
      hasFocus: false
    };
  },
  components: {},
  computed: {
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
      this._messageNodes = [];

      this._borderNodes = [this.$refs.inputCntr];
      this._backgroundNodes = [this.$refs.inputCntr];
      this._shadowNodes = [];
      this._paddingNodes = [this.$refs.inputCntr];
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.setValue(model.props.value);

      this.setStyle(style, model);
      this.setChatStyle(style);
    },

    getLabelNode () {
      return this.$refs.placeHolder;
    },

    /**
     * Apply the message* styles from the JSON to the message bubbles
     * and the general chat layout.
     */
    setChatStyle(style) {
      const gap = (style.gap ? style.gap : 8) * this._scaleX;
      this.$refs.messages.style.gap = Math.round(gap) + "px";
      

      if (style.inputHeight) {
        this.$refs.input.style.height = this.getZoomed(style.inputHeight, this._scaleY) + "px";
      }

      
      this.$refs.button.style.background = style.messageButtonBackground;
      this.$refs.button.style.color = style.messageButtonColor;
      this.$refs.button.style.borderRadius = this.getZoomed(style.borderTopRightRadius ? style.borderTopRightRadius : 0, this._scaleX) + "px";

      const radius = this.getZoomed(style.messageRadius ? style.messageRadius : 0, this._scaleX);
      for (let i = 0; i < this._messageNodes.length; i++) {
        const node = this._messageNodes[i];
        const bubble = node.bubble;
        if (node.role === "user") {
          bubble.style.background = style.messageUserBackground;
          bubble.style.color = style.messageUserColor;
        } else {
          bubble.style.background = style.messageAssistantBackground;
          bubble.style.color = style.messageAssistantColor;
        }
        /**
         * All corners are rounded, except the one pointing towards the
         * speaker: top-left for the assistant, top-right for the user.
         */
        bubble.style.borderRadius = radius + "px";
        if (this.model.props.messageAsBubble) {
          if (node.role === "user") {
            bubble.style.borderTopRightRadius = "0px";
          } else {
            bubble.style.borderTopLeftRadius = "0px";
          }
        }

        this._setShadow(bubble, style.boxShadow);

        bubble.style.paddingTop = this._getBorderWidth(style.paddingTop) + "px";
        bubble.style.paddingBottom = this._getBorderWidth(style.paddingBottom) + "px";
        bubble.style.paddingLeft = this._getBorderWidth(style.paddingLeft) + "px";
        bubble.style.paddingRight = this._getBorderWidth(style.paddingRight) + "px";
      }
    },

    setValue(value) {
      if (!Array.isArray(value)) {
        value = [];
      }
      this.value = value;
      this.renderMessages(value);
    },

    /**
     * Build the dynamic message rows into the "messages" scaffold node.
     */
    renderMessages(messages) {
      const cntr = this.$refs.messages;
      cntr.innerHTML = "";
      this._messageNodes = [];

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const role = message.role === "user" ? "user" : "assistant";

        const row = this.db
          .div("MatcWidgetTypeChatRow MatcWidgetTypeChatRow" + this.capitalize(role))
          .build(cntr);

        const bubble = this.db
          .div("MatcWidgetTypeChatBubble", message.content)
          .build(row);

        this._messageNodes.push({
          role: role,
          row: row,
          bubble: bubble
        });
      }
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
      if (txt) {
        this.value.push({
          type: "message",
          role: "user",
          content: txt
        });
        this.renderMessages(this.value);
        this.setChatStyle(this.style);
        input.value = "";
        this.scrollToBottom();
        this.emitDataBinding(this.value);
      }
    },

    scrollToBottom() {
      const cntr = this.$refs.messages;
      cntr.scrollTop = cntr.scrollHeight;
    },

    getValue() {
      return this.value;
    },

    getState() {
      return {
        type: "chat",
        value: this.value
      };
    },

    setState(state) {
      if (state && state.type == "chat") {
        this.setValue(state.value);
        this.setChatStyle(this.style);
      }
    },

    _setDataBindingValue(v) {
      this.setValue(v);
      this.setChatStyle(this.style);
    }
  },
  mounted() {}
};
</script>
