
<template>
  <div class="HelloWorldWidget ">
    Hello <span ref="lblNode" :style="{'margin-left': getScaledValue(style.space) + 'px'}" class="MatcInlineEditable">{{value}}</span> 
  </div>
</template>
<style>
.HelloWorldWidget{
  position: absolute;
	width:100%;
	height: 100%;
	overflow: hidden;
	text-align: left;
}

</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Label",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: "",
      style: {},
      model: {}
    };
  },
  components: {},
  computed: {
    options () {
      return this.style.options
    }
  },
  methods: {

    getName () {
      return 'Hello World'
    },

    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.domNode];
    },

    getCreateTemplates () {
      return [
        {
          "id" : "HelloWorld",
          "type" : "HelloWorld", // must be the same as tghe name used in the SymbolService
          "_type" : "Widget",
          "category" : "WireFrame",
          "subcategory" : "AAAAAA",
          "name" : "HelloWorld",
            "x" : 0,
            "y" : 0,
            "w" : 100,
            "h" : 30,
            "z" : 0,
            "props" : {
              "label" : "World"
            },
            "has" : {
              "backgroundColor" : true,
              "data": true,
              "border": true,
              "label" : true,
              "padding" : true,
              "advancedText" : true
            },
            "style" : {
              "fontSize" : 20,
              "fontFamily" : "Helvetica Neue,Helvetica,Arial,sans-serif",
              "textAlign" : "left",
              "letterSpacing" : 0,
              "lineHeight" : 1,
              "color": "#333333",
              "borderTopRightRadius" : 0,
              "borderTopLeftRadius" : 0,
              "borderBottomRightRadius" : 0,
              "borderBottomLeftRadius" : 0,
              "borderTopWidth" : 0,
              "borderBottomWidth" : 0,
              "borderRightWidth" : 0,
              "borderLeftWidth" : 0,
              "borderTopStyle" : "solid",
              "borderBottomStyle" : "solid",
              "borderRightStyle" : "solid",
              "borderLeftStyle" : "solid",
              "borderTopColor" : "#333333",
              "borderBottomColor" : "#333333",
              "borderRightColor" : "#333333",
              "borderLeftColor" : "#333333",
              "background": null
            }
        }
      ]
    },

    getDataProperties () {
      return [
        {
          label: "Space",
          type: "Number",
          key: "space",
          isProp:false,
        },
        {
          label: "Another Number",
          type: "Number",
          options: [10, 20, 30],
          key: "foo",
          isProp:false,
        },
        {
          label: "Checkbox",
          type: "Boolean",
          key: "bool",
          isProp:false,
        },
        {
          label: " Color",
          type: "Color",
          icon: 'mdi-table-large',
          key: "anotherColor",
          isProp:false
        },
        {
          label: "Options",
          type: "Options",
          options: [
            {label: 'A', value: 'A'},
            {label: 'B', value: 'B'},
          ],
          key: "options",
          isProp:false
        }
      ]
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, 'onClick')));
      this.own(on(this.domNode, touch.over, lang.hitch(this, 'onDomMouseOver')));
      this.own(on(this.domNode, touch.out, lang.hitch(this, 'onDomMouseOut')));
    },

    getLabelNode () {
      return this.$refs.lblNode;
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.setStyle(style, model);
      if (model.props && model.props.label) {
        this.setValue(model.props.label);
      }
    },

    getValue () {
      return this.value;
    },

    setValue (value) {
      this.value = value;
    },

    getState () {
      return {
        type: 'value',
        value: this.value
      };
    },

    setState (state) {
      /**
       * Hack for the time when we use the getValueLabel() mechnism!
       */
      if (this.hackValueLabel) {
        return;
      }
      if (state && state.type == 'value') {
        this.setValue(state.value);
      }
    },

    resize () {
    },

    onClick: function(e) {
      this.stopEvent(e);
      this.emitClick(e);
    }
  }
};
</script>