<template>
  <div class="MatcCode MatcToolbarTabContainer" @keydown.stop="stopKey" @keyup.stop="" @keypress.stop="">
    <div class="MatcToolbarTabs MatcToolbarTabsBig">
      <a @click="tab='css'" :class="{'MatcToolbarTabActive': tab === 'css'}">CSS X</a>
      <a @click="tab='html'" :class="{'MatcToolbarTabActive': tab === 'html'}" v-if="hasHTML">HTML</a>
      <a @click="tab='vue'" :class="{'MatcToolbarTabActive': tab === 'vue'}" v-if="hasVue">VUE</a>
     <!-- <a @click="showPreview()" :class="{'MatcToolbarTabActive': tab === 'preview'}" v-if="hasPreview">Preview</a> -->
    </div>
    <div class="MatcCodeContainer" v-show="tab!== 'preview'">
      <pre v-show="tab=='html'"><code ref="codeHTML" class="html" >{{htmlTemplate}}</code></pre>
      <pre v-show="tab=='css'"><code ref="codeCSS" class="css" >{{cssTemplate}}</code></pre>
      <pre v-show="tab=='vue'"><code ref="codeVue" class="html" >{{vueTemplate}}</code></pre>
     </div>
     <div v-show="tab === 'preview'" class="MatcCodePreview">
       You can try out the HTML code in the popup window.
     </div>
  </div>
</template>
<style lang="css">
@import url("../style/code.css");
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import hljs from 'highlight.js/lib/highlight'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'

import Vue from 'vue'
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)

export default {
  name: "home",
  mixins: [DojoWidget],
  props: ['css', 'html', 'js', 'vue', 'hasVue', 'selected', 'hasHTML', 'hasPreview'],
  data: function() {
    return {
      cssTemplate: '',
      htmlTemplate: '',
      htmlPreview: '',
      vueTemplate: '',
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
        hljs.highlightBlock(this.$refs.codeCSS);
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
        hljs.highlightBlock(this.$refs.codeVue);
      })
    },
    setHTMLTemplate (v) {
      v = v.trim()
      this.hasHTML = true
      this.htmlTemplate = v
      Vue.nextTick(() => {
        hljs.highlightBlock(this.$refs.codeHTML);
      })
    },
    setPreview (v) {
      this.hasPreview = true
      this.htmlPreview = v
    }
  },
  watch: {
      html (v) {
        this.htmlTemplate = v
        Vue.nextTick(() => {
          hljs.highlightBlock(this.$refs.codeHTML);
        })
      },
      css (v) {
        this.cssTemplate = v
        Vue.nextTick(() => {
          hljs.highlightBlock(this.$refs.codeCSS);
        })
      },
      vue (v) {
        this.vueTemplate = v
        Vue.nextTick(() => {
          hljs.highlightBlock(this.$refs.codeVue);
        })
      }
  },
  mounted() {
    this.cssTemplate = this.css
    this.htmlTemplate = this.html
    this.vueTemplate = this.vue

    if (this.selected) {
      this.tab = this.selected
    }
    Vue.nextTick(() => {
      hljs.highlightBlock(this.$refs.codeCSS);
      hljs.highlightBlock(this.$refs.codeHTML);
      hljs.highlightBlock(this.$refs.codeVue);
    })

  }
};
</script>

