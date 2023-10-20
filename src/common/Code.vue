<template>
  <div class="MatcCode " @keydown.stop="stopKey" @keyup.stop="" @keypress.stop="">
    <div class="MatcToolbarTabs MatcToolbarTabsBig">
      <a @click="tab='lowCode'" :class="{'MatcToolbarTabActive': tab === 'lowCode'}" v-if="hasLowCode">Vue Low Code</a>
      <a @click="tab='css'" :class="{'MatcToolbarTabActive': tab === 'css'}">CSS</a>
      <a @click="tab='html'" :class="{'MatcToolbarTabActive': tab === 'html'}" v-if="hasHTML">HTML</a>
     <!-- <a @click="showPreview()" :class="{'MatcToolbarTabActive': tab === 'preview'}" v-if="hasPreview">Preview</a> -->
    </div>
    <div class="MatcCodeContainer" v-show="tab!== 'preview'">
      <pre v-show="tab=='html'"><code ref="codeHTML" class="html" >{{htmlTemplate}}</code></pre>
      <pre v-show="tab=='css'"><code ref="codeCSS" class="css" >{{cssTemplate}}</code></pre>
      <pre v-show="tab=='vue'"><code ref="codeVue" class="html" >{{vueTemplate}}</code></pre>
      <div v-show="tab=='lowCode'">

        <span class="MatcHint">Install the luisa-vue package with NPM.</span>
        
        <pre>
          <code ref="codeNPM" class="html" >{{npmTemplate}}</code>
        </pre>

        <span class="MatcHint">Copy this class to your main file, e.g. Home.vue. </span>
        <pre>
          <code ref="codeLowCode" class="html" >{{lowCodeTemplate}}</code>
        </pre>

         <span class="MatcHint">Replace the router/index.js with this code.</span>
         <pre>
          <code ref="codeRouter" class="javascript" >{{routerTemplate}}</code>
        </pre>

      </div>
     </div>
  </div>
</template>
<style lang="scss">
@import "../style/components/code.scss";
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import Vue from 'vue'


export default {
  name: "home",
  mixins: [DojoWidget],
  props: ['css', 'html', 'js', 'vue', 'hasVue', 'selected', 'hasHTML', 'hasPreview', 'lowCode', 'hasLowCode', 'npm', 'router'],
  data: function() {
    return {
      cssTemplate: '',
      htmlTemplate: '',
      htmlPreview: '',
      vueTemplate: '',
      lowCodeTemplate: '',
      npmTemplate: '',
      routerTemplate:'',
      tab:'css'
    };
  },
  components: {
  },
  computed: {
    iframeSrc () {
      return 'data:text/html;charset=utf-8,' + encodeURIComponent(this.htmlPreview);
    }
  },
  methods: {
    showPreview () {
      if (this.model) {
        this.tab = 'preview'
        let w = this.model.screenSize.w
        let h = this.model.screenSize.h
        var myWindow = window.open("", "Quant-UX", `width=${w},height=${h},status=no,titlebar=no,scrollbars=yes,location=no`);
        myWindow.document.write(this.htmlPreview);
      }
    },
    setModel (m) {
      this.model = m
    },
    setCSS (v) {
      v = v.trim()
      if (this.cssTemplate) {
        this.$refs.codeCSS.innerHTML = v
      }
      this.cssTemplate = v
      Vue.nextTick(() => {
        this.highlightBlock(this.$refs.codeCSS);
      })
    },
    setVue (v) {
      v = v.trim()
      if (this.vueTemplate) {
        // this causes some stupid errors because the browser parses the code
        this.$refs.codeVue.innerHTML = v
      }
      this.hasVue = true
      this.vueTemplate = v
      Vue.nextTick(() => {
        this.highlightBlock(this.$refs.codeVue);
      })
    },
    setHTMLTemplate (v) {
      v = v.trim()
      this.hasHTML = true
      this.htmlTemplate = v
      Vue.nextTick(() => {
        this.highlightBlock(this.$refs.codeHTML);
      })
    },
    setLowCodeTemplate (v) {
      v = v.trim()
      this.tab = 'lowCode'
      this.hasLowCode = true
      this.lowCodeTemplate = v
      Vue.nextTick(() => {
        this.highlightBlock(this.$refs.codeLowCode);
      })
    },
    setNPMTemplate (v) {
      this.npmTemplate = v
      Vue.nextTick(() => {
        this.highlightBlock(this.$refs.codeNPM);
      })
    },
    setRouterTemplate (v) {
      this.routerTemplate = v
      Vue.nextTick(() => {
        this.highlightBlock(this.$refs.codeRouter);
      })
    },
    setPreview (v) {
      this.hasPreview = true
      this.htmlPreview = v
    },
    highlightBlock (ref) {
      if (this.hljs) {
        this.hljs.highlightBlock(ref);
      }
    }
  },
  watch: {
      html (v) {
        this.htmlTemplate = v
        Vue.nextTick(() => {
          this.highlightBlock(this.$refs.codeHTML);
        })
      },
      css (v) {
        this.cssTemplate = v
        Vue.nextTick(() => {
          this.highlightBlock(this.$refs.codeCSS);
        })
      },
      vue (v) {
        this.vueTemplate = v
        Vue.nextTick(() => {
          this.highlightBlock(this.$refs.codeVue);
        })
      },
      lowCode (v) {
        this.lowCode = v
        Vue.nextTick(() => {
          this.highlightBlock(this.$refs.codeLowCode);
        })
      }
  },
  async mounted() {
    this.cssTemplate = this.css
    this.htmlTemplate = this.html
    this.vueTemplate = this.vue
    this.codeLowCode = this.lowCode
    this.npmTemplate = this.npm
    this.routerTemplate = this.router

    /*
     * We load highlight.js as late as possible
     */

    hljs.registerLanguage('javascript', javascript)
    hljs.registerLanguage('html', xml)
    hljs.registerLanguage('css', css)
    this.hljs = hljs

    if (this.selected) {
      this.tab = this.selected
    }
    Vue.nextTick(() => {
      hljs.highlightBlock(this.$refs.codeCSS);
      hljs.highlightBlock(this.$refs.codeHTML);
      hljs.highlightBlock(this.$refs.codeVue);
      hljs.highlightBlock(this.$refs.codeLowCode);
      hljs.highlightBlock(this.$refs.codeNPM);
      hljs.highlightBlock(this.$refs.codeRouter);
    })

  }
};
</script>

