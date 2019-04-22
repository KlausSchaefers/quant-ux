<template>
  <div class="home">
    <h1>Code Test Cases</h1>
    <div class="CodeWrapper">
        <div id="previewContainer" class="MatcPreviewWrapper">

        </div>
        <div ref="canvas" class="CodeCanvas">

        </div>
    </div>

    <div class="MatcToolbarPopUp">
        <a @click="preview">Preview</a>
        <Code :css="css" :html="html" selected="html" :vue="vueCode" hasVue="true" hasHTML="true"/>
    </div>

    <div ref="iframeCntr" class="iframeCntr" v-show="hasIframe">
    </div>
  </div>
</template>

<style lang="css">
@import url("../../public/style/matc.css");

.CodeWrapper, .CodeDebugCanvas{
   margin: 20px;
   height: 667px;
   width: 375px;
   position: relative;

}

.MatcToolbarPopUp{
    position: fixed;
    left:500px;
    top:20px;
    width:800px;
    height:400px;
    font-size: 10px;
    display: block;
}


.MatcPreviewWrapper{
    width: 100%;
    height: 100%;
    position: absolute;
    top:0px;
    left:0px;
    opacity: 0.5;
}

.CodeCanvas{
    position: absolute;
    top:0px;
    left:0px;
    width: 100%;
    height: 100%;
}
.CodeBox{
     position: absolute;
     outline: orange 0px dashed;
     font-size: 10px;
     color:rgba(0, 0, 0, 1)
}

.CodeBox.row{
     outline: red 1px solid;
     margin: 0px;
}

.CodeBox.column{
     outline: blue 1px solid;
     margin: 0px;
}

.iframeCntr{
   height: 677px;
    width: 385px;
    position: fixed;
    background: #ccc;
    top: 20px;
    left: 20px;
    z-index: 9999;
    border: 0px;
    box-shadow: 0 0 80px;
    resize: both;
    overflow: auto;
    padding: 5px;
}
iframe {
    width: 100%;
    height: 100%;
    border: 0px;
}


</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import Services from 'services/Services'
import Preview from "page/Preview";
import Code from 'common/Code'
import DomBuilder from 'common/DomBuilder'


const cli = require('quant-ux-cli')


import app1 from './data/app1.json'
import app2 from './data/app2.json'
import app3 from './data/app3.json'
import app4 from './data/app4.json'
import app5 from './data/app5.json'
import app6 from './data/app6.json'
import app7 from './data/app7.json'
import app8 from './data/app8.json'
import app9 from './data/app9.json'

export default {
  name: "home",
  mixins: [DojoWidget],
  data: function() {
    return {
        apps: [app1, app2, app3, app4, app5, app6, app7, app8, app9],
        onlyContainer: false,
        html: '<html>None</html>',
        css: '.Nonething{ color:red}',
        iframeCode: '',
        vueCode: 'Vue',
        hasIframe: false
    };
  },
  components: {
      'Code': Code
  },
  methods: {

    preview () {
        if (!this.iframe) {
            this.hasIframe = true;
            var iframe = document.createElement('iframe');
            iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(this.iframeCode);
            this.$refs.iframeCntr.appendChild(iframe);
            this.iframe = iframe
        } else {
            this.iframe.parentNode.removeChild(this.iframe)
            delete this.iframe
            this.hasIframe = false;
        }

    },

    render (app) {
        let t = new cli.ModelTransformer(app)
        let grid = t.transform(false)
        let screen = grid.screens.find(s => s.id === "s10000")
        let db = new DomBuilder();
        this.renderElements(screen.children, db, this.$refs.canvas)
    },

    generate (app) {
        let gen = new cli.Generator(new cli.HTMLFactory(), new cli.CSSFactory(true))
        let code = gen.run(app)
        console.debug(code)
        let screen = code.screens.find(s => s.id === "s10000")
        this.html = screen.template

        let css = ''
        let normalize = code.styles['$NORMALIZE']
        if (normalize) {
            css += normalize.map(s => s.code).join('\n')
        }
        css += screen.styles.map(s => s.code).join('\n')

        let elements = cli.ExportUtil.getAllChildrenForScreen(screen)
        elements.forEach(element => {
            let styles = code.styles[element.id]
            css += styles.map(s => s.code).join('\n')
        })
        this.css = css

        let writer = new cli.SinglePageWriter()
        let files = writer.getFiles(code)
        this.iframeCode = files[0].content

        /**
         * Vue
         */
        let vueGenerator = new cli.Generator(new cli.VueFactory(), new cli.CSSFactory(true))
        let vueResult = vueGenerator.run(app)
        writer = new cli.VueSinglePageWriter()
        files = writer.getFiles(vueResult)
        let selectedFile = files.find(f => f.id === "s10000" && f.type === 'vue')

        this.vueCode = selectedFile.content

    },

    renderElements (children, db, cntr) {
        children.forEach(e => {
            if (!this.onlyContainer || e.type == 'row') {
              let label = e.name
              if (e.row) {
                label +=  `(r:${e.row})`
              }
              if (e.column) {
                label +=  `(c:${e.column})`
              }
              let div = db.div('CodeBox ' +e.type,label).left(e.x).top(e.y).h(e.h).w(e.w).build(cntr)
              if (e.children && e.children.length > 0) {
                this.renderElements(e.children, db, div)
              }
            }

        })
    },

    async loadData () {
        let app = this.apps[this.$route.params.id * 1]
        if (!app) {
            app = await Services.getModelService().findApp(this.$route.params.id)
        }
        let preview = this.$new(Preview)
        preview.placeAt('previewContainer')
        preview.setModel(app)
        this.render(app)
        this.generate(app)
    }
  },
  mounted() {
    console.debug(cli)
    this.loadData();
  }
};
</script>
