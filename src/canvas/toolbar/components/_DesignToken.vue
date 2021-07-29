<script>
export default {
  name: "_DesignToken",
  mixins: [],
  data: function () {
    return {
      model: false,
      box: false,
      cssProps: [],
      widgetViewMode: 'style'
    };
  },
  computed: {
    currentDesignToken () {
        if (this.box && this.box.designtokens && this.cssProps.length > 0 && this.model && this.model.designtokens) {
            let tokensByMode = this.box.designtokens[this.widgetViewMode]
            if (tokensByMode) {
                let designTokenId = this.findDesignToken(tokensByMode, this.cssProps)
                if (designTokenId) {
                  let designToken = this.model.designtokens[designTokenId]
                  if (designToken) {
                      return designToken
                  } else {
                      console.debug('_DesignToken () > currentDesignToken() No token with id: ' + designTokenId, tokensByMode)
                  }
                }
            }
        }
        return null;
    },
    hasDesignToken() {
      return this.currentDesignToken !== null
    },
  },
  methods: {

    findDesignToken (token, cssProps = []) {
        for (let i = 0; i < cssProps.length; i++) {
            let prop = cssProps[i]
            if (token[prop]) {
                return token[prop]
            }
        }
    },

    setWidgetViewMode (mode) {
      this.widgetViewMode = mode
    },

    setCssProps(props) {
      this.cssProps = props;
    },

    setModel(m) {
      this.model = null
      this.model = m;
    },

    setBox(b) {
      this.box = null
      this.box = {};
      if (b) {
        let designtokens = b.designtokens
        /**
         * In case we have a template, we take the design token from teh template.
         * TODO: If we allow mixing, at some point we have to somehpw be carefull
         */
        if (b.template && this.model && this.model.templates) {
          let template = this.model.templates[b.template]
          if (template && template.designtokens) {
            designtokens = template.designtokens
          }
        }
        this.$set(this.box, 'designtokens', designtokens)
        this.$forceUpdate()
      }
    },
  },
};
</script>