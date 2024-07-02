
<template>
    <div class="MatchWidgetTypeGeoLocation">
        <span class="MatcInlineEditable" ref="labelNode">{{label}}</span> 
    </div>
  </template>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import lang from "dojo/_base/lang";
  import UIWidget from "core/widgets/UIWidget";
  
  export default {
    name: "GeoLocation",
    mixins: [UIWidget, DojoWidget],
    data: function() {
      return {
        value: "",
        model: null,
        scale: 1
      };
    },
    components: {},
    computed: {
        label () {
            if (!navigator.geolocation) {
                return "Not supported"
            }
            if (this.value) {
                return `Lat: ${this.value.latitude} - Long:${this.value.longitude}`
            }
            if (this.model && this.model.props && this.model.props.label) {
                return this.model.props.label
            }
            return ''
        },
    },
    methods: {
      postCreate() {
        this._borderNodes = [this.domNode];
        this._backgroundNodes = [this.domNode];
        this._shadowNodes = [this.domNode];
        this._paddingNodes = [this.domNode];
        this._labelNodes = [this.$refs.labelNode];
      },
  
      wireEvents() {
        this.own(this.addClickListener(this.domNode, lang.hitch(this, "getGeoLocation")));
        this.wireHover()
        if (this.model?.props?.autoLoad) {
            this.readGeoLocation()
        }

      },

      getGeoLocation (e) {
        this.onClick(e)
        this.readGeoLocation()
      },
  
      readGeoLocation () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                this.value = pos.coords
                this.emitDataBinding(this.value);
            })
        }
      },

      getLabelNode() {
        return this.$refs.labelNode;
      },
  
      render(model, style, scaleX, scaleY) {
        this.model = model;
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this.scale = scaleX
        this.setStyle(style, model);
      },
  
      getValue() {
        return this.value;
      },
  
      setValue() {
      
      },
  
      getState() {
      },
  
      setState() {
      },
  
      onClick(e) {
        this.stopEvent(e);
        this.emitClick(e);
      }
    },
    mounted() {}
  };
  </script>