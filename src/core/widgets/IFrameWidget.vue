<template>
    <div class="MatcIFrameWidget">
        <div class="MatcIFrameWidgetCover">
            <span class="" v-if="url && !isValidURL"> The URL must start with https://www.youtube.com/embed/</span>
            <span class="mdi mdi-youtube" v-if="!url" :style="'fontSize:' + fontSize">
            </span>            
        </div>
        <iframe width="100%" height="100%" v-if="url && isValidURL" :src="url" title="" class="MatcIFrameWidgetFrame" sandbox="allow-scripts allow-same-origin"></iframe>
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
  name: "IFrameWidget",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: this.value,
      style: {},
      model: {},
      height: 0,
      url: '',
    };
  },
  components: {},
  computed: {
    fontSize () {
        if (this.model) {
            return Math.round(this.height * 0.8 * this._scaleX) + 'px'
        }

        return '60px'
    },
    isValidURL () {
      return this.url.indexOf('https://www.youtube.com/embed/') === 0 && this.url.indexOf('Javascript') < 0
    }
  },
  methods: {
    getName () {
      return 'Iframe'
    },
    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.domNode];
    },
    resize (box) {
      var h = Math.min(box.h, box.w);
      this.height = h
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, 'onClick')));
      this.own(on(this.domNode, touch.over, lang.hitch(this, 'onDomMouseOver')));
      this.own(on(this.domNode, touch.out, lang.hitch(this, 'onDomMouseOut')));
    },
    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.url = ""
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
      if (model.props && model.props.url  ) {
        const url = model.props.url    
        this.url = url         
      }
      this.resize(model)
    },
    getValue () {
      return this.value;
    },
    setValue (value) {
      this.value = value;
    },
    getState () {
    },
    setState () {
    },
    onClick: function(e) {
      this.stopEvent(e);
      this.emitClick(e);
    }
  }
};
</script>