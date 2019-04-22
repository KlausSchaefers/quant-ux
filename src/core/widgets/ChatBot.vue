
<template>
  <div class="MatcWidgetTypeChatBot"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from "common/DomBuilder";

export default {
  name: "ChatBot",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: {},
      options: []
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._hookNodes = [];
      this._labelNodes = [];
      this._rowNodes = [];
      this._paddingNodes = [];
      this._arrowNodes = [];
      this._inputNodes = {};
      this.db = new DomBuilder();
    },

    setMode: function(m) {
      this._isEditor = m != "simulator";
    },

    cleanupRender: function() {
      this.domNode.innerHTML = "";
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._hookNodes = [];
      this._labelNodes = [];
      this._rowNodes = [];
      this._paddingNodes = [];
      this._arrowNodes = [];
      this._inputNodes = {};
    },

    wireEvents: function() {
      this.wired = true;
      //			for (var i=0; i < this._borderNodes.length; i++){
      //				var back = this._borderNodes[i];
      //				var label = this._labelNodes[i];
      //				var option = this.options[i];
      //				this.own(this.addClickListener(back, lang.hitch(this, "onChange", option)));
      //				this.own(this.addClickListener(label, lang.hitch(this, "onChange", option)));
      //			}
    },

    resize: function() {
      //this.setChildSize(box, this.style, this.scaleX, this.scaleY);
    },

    /**
     * rendering
     */

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this.flows = model.props.flows;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this._paddingFactor = 10 * scaleX;
      this.initValue();

      this.currentFlow = this.getFLow(this.flows);
      this.renderFlow(this.currentFlow);

      this.setStyle(this.style);
      this.setArrowStyle(this.style);
    },

    rerender: function() {
      this.renderFlow(this.currentFlow);
      this.setStyle(this.style);
      this.setArrowStyle(this.style);
    },

    renderFlow: function(steps) {
      //console.debug("renderFlow", steps);
      this.cleanupRender();

      /**
       * Create container
       */
      var cntr = this.db.div("MatcWidgetTypeChatBotCntr").build();
      cntr.style.paddingLeft = this._paddingFactor + "px";
      cntr.style.paddingRight = this._paddingFactor + "px";
      var step = null;
      var state = null;

      /**
       * Render everything for what we have a state or all if we
       * are in the editor
       */
      for (var i = 0; i < steps.length; i++) {
        step = steps[i];
        state = this.value[i];
        if (state || this._isEditor) {
          this.renderStep(step, state, cntr, false);
        } else {
          // we stop if there is no state
          break;
        }
      }

      /**
       * if there is still a step to show and
       * we are not in editor
       */
      if (step && !state && !this._isEditor) {
        this.initStep(step, null, cntr);
      }
      this.cntr = cntr;
      this.domNode.appendChild(cntr);
    },

    renderStep: function(step, state, parent, active) {
      //console.debug("renderStep", step)
      var div = this.db.div("MatcWidgetTypeChatBotRow").build(parent);
      div.style.marginBottom = this._paddingFactor + "px";

      var arrow = this.db.div("MatcWidgetTypeChatArrow").build(div);
      this._arrowNodes.push({
        step: step,
        node: arrow
      });

      if (this["renderStep_" + step.type]) {
        var bubble = this.db.div("MatcWidgetTypeChatBotBubble").build(div);
        this["renderStep_" + step.type](step, state, bubble, active);
        this._labelNodes.push(bubble);
        this._shadowNodes.push(bubble);
        this._borderNodes.push(bubble);
        this._backgroundNodes.push(bubble);
        this._paddingNodes.push(bubble);
      }
      return div;
    },

    renderStep_Question: function(step, state, div) {
      return this.db.div("MatcWidgetTypeChatQuestion", step.label).build(div);
    },

    renderStep_AnswerTextBox: function(step, state, div) {
      css.add(div, "MatcWidgetTypeChatAnswer");
      var label = state ? state.value : "";
      var row = this.db.div("").build(div);
      var input = this.db.div("MatcWidgetTypeChatTextArea", label).build(row);
      this._inputNodes[step.id] = input;
    },

    /**
     * Live cycle methods of chat
     */
    initStep: function(step, state, parent) {
      console.debug("initStep", step);
      var div = this.renderStep(step, state, parent, true);
      css.add(div, "MatcWidgetTypeChatHidden");
      var me = this;
      setTimeout(function() {
        me.showStep(step, state, div);
      }, this.getDuration(step));
    },

    showStep: function(step, state, div) {
      this.scrollParentToChild(this.domNode, div);
      css.remove(div, "MatcWidgetTypeChatHidden");
      this.setStepState(step, { start: new Date().getTime() });
      this.focusStep(step, state, div);
    },

    focusStep: function(step) {
      if (step.type == "Question") {
        this.finishStep(step, null);
      } else {
        var input = this._inputNodes[step.id];
        if (input && input.focus) {
          this._keyListener = on(
            input,
            "keyup",
            lang.hitch(this, "onKeyUp", step)
          );
          setTimeout(function() {
            input.setAttribute("contentEditable", true);
            input.focus();
          }, 100);
        }
      }
    },

    finishStep: function(step, value) {
      console.debug("finishStep", step, value);
      this.setStepState(step, { end: new Date().getTime(), value: value });
      this.rerender();
    },

    onKeyUp: function(step, e) {
      this.stopEvent(e);
      var k = e.keyCode ? e.keyCode : e.which;
      if (k == 13) {
        var txt = e.target.innerHTML;
        txt = txt.replace(/<br>/g, "\n");
        txt = this.stripHTML(txt);
        this.finishStep(step, txt);
      }
      // TODO: we could save key strokes for replay...
    },

    getValue: function() {
      return this.value;
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {
      if (!v) {
        v = {};
      }
      this.setValue(v);
    },

    setStepState: function(step, values) {
      if (!this.value[step.id]) {
        this.value[step.id] = {};
      }
      for (var key in values) {
        this.value[step.id][key] = values[key];
      }
    },

    setValue: function(value) {
      if (!value) {
        value = {};
      }
      this.value = value;
      this.rerender();
    },

    initValue: function() {
      if (!this.value) {
        this.value = {};
      }
    },

    getState: function() {
      return {
        type: "checked",
        value: this.value
      };
    },

    setState: function(state) {
      if (state && state.type == "checked") {
        this.setValue(state.value);
      }
    },

    onChange: function() {
      //			this.stopEvent(e);
      //
      //			var pos = this.value.indexOf(option);
      //			if (pos < 0) {
      //				this.value.push(option)
      //			} else {
      //				this.value.splice(pos, 1);
      //			}
      //
      //			this.setValue(this.value);
      //			this.emitDataBinding(this.value);
      //			this.emitStateChange("checked", this.value, e);
    },

    setArrowStyle: function(style) {
      for (var i = 0; i < this._arrowNodes.length; i++) {
        var step = this._arrowNodes[i].step;
        var arrow = this._arrowNodes[i].node;
        arrow.style.width = "10px";
        arrow.style.height = "10px";
        if (step.type == "Question") {
          arrow.style.left = Math.round((-1 * this._paddingFactor) / 2) + "px";
        } else {
          arrow.style.right = Math.round((-1 * this._paddingFactor) / 2) + "px";
        }

        if (style.borderLeftWidth) {
          arrow.style.background = style.borderLeftColor;
        } else {
          arrow.style.background = style.background;
        }
      }
    },

    scrollParentToChild: function(parent, child) {
      var parentRect = parent.getBoundingClientRect();
      var parentViewableArea = {
        height: parent.clientHeight,
        width: parent.clientWidth
      };

      var childRect = child.getBoundingClientRect();
      // we added here an extra padding of 20! In Android we might still need to do more stuff
      var isViewable =
        childRect.top >= parentRect.top &&
        childRect.top + 20 <= parentRect.top + parentViewableArea.height;
      if (!isViewable) {
        parent.scrollTop = childRect.top + parent.scrollTop - parentRect.top;
      }
    },

    /**
     * Helpers
     */
    getDuration: function(step) {
      if (step.duration) {
        return step.durartion;
      }
      return 1000;
    },

    getFLow: function(flows) {
      var steps = flows[0].steps;
      for (var i = 0; i < steps.length; i++) {
        let step = steps[i];
        step.id = i;
      }
      return steps;
    },

    arraysEqual: function(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      for (var i = arr1.length; i--; ) {
        if (arr1[i] !== arr2[i]) return false;
      }
      return true;
    }
  },
  mounted() {}
};
</script>