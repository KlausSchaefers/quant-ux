
<template>
  <div class="MatcWidgetTypeSegmentButton"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "SegmentButton",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false
    };
  },
  components: {},
  computed: {
    isMulti () {
      if (this.model && this.model.props && this.model.props.multi) {
        return true
      }
      return false
    }
  },
  methods: {
    postCreate () {
      this._labelNodes = [];
      this._borderNodes = [];
      this._shadowNodes = [];
      this._backgroundNodes = [];
      this._paddingNodes = [];
    },

    wireEvents () {
      this.wired = true;
      for (let i = 0; i < this.btns.length; i++) {
        const option = this.btns[i].o;
        const btn = this.btns[i].b;
        this.own(this.addClickListener(btn, lang.hitch(this, "onSelect", option)));
      }
      this.wireHover()
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      const db = new DomBuilder();

      this.removeAllChildren(this.domNode)
      // this.domNode.innerHTML = "";
      const options = this.model.props.options;

      const width = 100 / options.length;
      this.btns = [];
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const btn = db
          .div("MatcWidgetTypeSegmentButtonChild")
          .build(this.domNode);

        btn.style.width = width + "%";

        const label = db.span("", option).build(btn);
        this._labelNodes.push(label)



        this.setDomStyle(btn, style, i);
        this.btns.push({o: option, b: btn});
        this._paddingNodes.push(btn);

        if (i == 0) {
          btn.style.borderTopLeftRadius = this.getZoomed(style.borderTopLeftRadius, this._scaleX) + "px";
          btn.style.borderBottomLeftRadius = this.getZoomed(style.borderBottomLeftRadius, this._scaleX) + "px";
        }
        if (i == options.length - 1) {
          btn.style.borderTopRightRadius = this.getZoomed(style.borderTopRightRadius, this._scaleX) + "px";
          btn.style.borderBottomRightRadius = this.getZoomed(style.borderBottomRightRadius, this._scaleX) + "px";
        }
      }

      this.setStyle(style, model);
      if (this.model.props.selected) {
        /**
         * Since 2.2.6 we can have optionally multi select. In this
         * case we must pass and array to setValue
         */
        if (this.isMulti) {
          let selected = this.model.props.selected     
          this.setValue(selected, true);
        } else {
          this.setValue(this.model.props.selected, true);
        }
      } else {
        if (this.isMulti) {
          this.setValue([], true);
        } else {
          this.setValue('', true);
        }
      }
    },

    setDomStyle (btn, style, i) {
      if (style.borderLeftColor) {
        btn.style.borderLeftColor = style.borderLeftColor;
      }

      if (style.borderTopColor) {
        btn.style.borderTopColor = style.borderTopColor;
      }

      if (style.borderBottomColor) {
        btn.style.borderBottomColor = style.borderBottomColor;
      }

      if (style.borderRightColor) {
        btn.style.borderRightColor = style.borderRightColor;
      }

      if (style.borderLeftWidth) {
        btn.style.borderLeftWidth =
          this.getZoomed(style.borderLeftWidth, this._scaleX) + "px";
      }

      if (style.borderBottomWidth) {
        btn.style.borderBottomWidth =
          this.getZoomed(style.borderBottomWidth, this._scaleX) + "px";
      }

      if (style.borderTopWidth) {
        btn.style.borderTopWidth =
          this.getZoomed(style.borderTopWidth, this._scaleX) + "px";
      }

      if (style.borderRightWidth) {
        btn.style.borderRightWidth =
          this.getZoomed(style.borderRightWidth, this._scaleX) + "px";
      }

      if (i > 0) {
        btn.style.borderLeftColor = style.background;
        btn.style.borderLeftWidth = "0px";
        /**
         * Compensate missing border with padding is well!
         */
        const p = this.getZoomed(style.paddingLeft, this._scaleX);
        const b = this.getZoomed(style.borderLeftWidth, this._scaleX);
        btn.style.paddingLeft = p + b + "px";
      } else {
        btn.style.paddingLeft =
          this.getZoomed(style.paddingLeft, this._scaleX) + "px";
      }
      btn.style.background = style.background;
      btn.style.color = style.color;
    },

    onSelect (option, e) {
      this.stopEvent(e);

      /**
       * Since 2.2.6 we can have optionally multi select
       */
      let value = option
      if (this.isMulti) {
        let selected = this.value.slice()
        const pos = selected.indexOf(value)
        if (pos < 0) {
          selected.push(value)
        } else {
          selected.splice(pos, 1);
        }
        value = selected
      }

      this.value = value
      this.emitDataBinding(value);
      this.setValue(value);
      this.emitStateChange("select", value, e);
    },

    getValue() {
      return this.value;
    },

    setValue(value) {
      const active = this.model.active;
      const style = this.style;

      /**
       * Since 2.2.6 we can have optionally multi select. We expect an array here
       */
      if (this.isMulti) {
        /**
         * Sometimes the value is not an array..
         */
        if (!Array.isArray(value)) {
          value = [value]
        }
       
        for (let i = 0; i < this.btns.length; i++) {
          const option = this.btns[i].o;
          const btn = this.btns[i].b;
          if (value.indexOf(option) >= 0 && active) {
            this.setDomStyle(btn, active, 0);
          } else {
            this.setDomStyle(btn, style, i);
          }
        }
              
      } else {
        for (let i = 0; i < this.btns.length; i++) {
          const option = this.btns[i].o;
          const btn = this.btns[i].b;
          if (option == value && active) {
            this.setDomStyle(btn, active, 0);
          } else {
            this.setDomStyle(btn, style, i);
          }
        }
      }
      this.value = value;
    },

    getState() {
      return {
        type: "select",
        value: this.value
      };
    },

    setState(state) {
      if (state) {
        if (state.type == "select") {
          this.setValue(state.value);
        }
      }
    },

    beforeDestroy: function() {
    }
  },
  mounted() {}
};
</script>