
<template>
  <div class="MatcWidgetTypeVector" :style="{'backgroundImage': backgroundImage}">{{errorMsg}}</div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import Logger from 'common/Logger'

export default {
  name: "Vector",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      backgroundImage: '',
      errorMsg: ''
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, e => {
        this.onClick(e)
      }));
      this.wireHover()
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      var figmaImage = model.props.figmaImage;
      if (style.backgroundImage) {
        if (this.hash) {
          this.backgroundImage = "url(/rest/images/" + this.hash + "/" + style.backgroundImage.url + ")";
        } else if (this.jwtToken) {
          this.backgroundImage = "url(/rest/images/" + style.backgroundImage.url + "?token=" + this.jwtToken + ")";
        } else {
          this.backgroundImage = "url(/rest/images/" + style.backgroundImage.url + ")";
        }
      } else if (figmaImage) {
        this.backgroundImage = `url(${figmaImage})`
      } else {
        this.errorMsg = 'No figma image'
      }
    },

    getValue () {},

    setValue () {},

    getState () {
      return {};
    },

    setState () {}
  },
  mounted() {
    this.logger = new Logger('Vector')
  }
};
</script>