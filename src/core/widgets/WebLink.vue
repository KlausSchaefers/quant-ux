
<template>
  <div class="MatcWidget MatcWidgetTypeWebLink MatcEventedWidget MatcSimulatorClickable">
      <div data-dojo-attach-point="labelNode" class="MatcInlineEditable">{{label}}</div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import Logger from 'common/Logger'
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Label",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: "",
      isWired: false,
      model: null
    };
  },
  components: {},
  computed: {
      label () {
          if (this.model && this.model.props && this.model.props.label) {
              return this.model.props.label
          }
          return ''
      }
  },
  methods: {
    postCreate() {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.labelNode];
    },

    wireEvents() {
      this.isWired = true
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover()
    },

    getLabelNode() {
      return this.labelNode;
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
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
      if (this.isWired && this.model && this.model.props && this.model.props.label) {
        let url = this.model.props.label
        if (url.toLowerCase().indexOf('javascript') < 0) {
          let pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
          var regex = new RegExp(pattern);
          if (url.match(regex)) {
            window.open(url, '_blank');
          } else {
            let e = new Error('WebLink.onClick() > URL is bad: ' + url)
            this.logger.error('onClick', 'Error > URL pattern is bad: ' + url, e)
          }
        } else {
          let e = new Error('WebLink.onClick() > URL has JS: ' + url)
          this.logger.error('onClick', 'Error > URL has JS: ' + url, e)
          this.logger.sendError(e)
        }
      }
      this.stopEvent(e);
      this.emitClick(e);
    }
  },
  mounted() {
    this.logger = new Logger('WebLink')
  }
};
</script>