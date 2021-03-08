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
                let designToken = this.model.designtokens[designTokenId]
                if (designToken) {
                    return designToken
                } else {
                    console.debug('_DesignToken () > currentDesignToken() No token with id', designToken, tokensByMode)
                }
                console.debug(tokensByMode, designTokenId)
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
      this.model = m;
    },

    setBox(b) {
      this.box = b;
    },
  },
};
</script>