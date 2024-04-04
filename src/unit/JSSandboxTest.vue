<template>
  <div class="MatcLight">
    <h1>JS Sandbox Test</h1>

   <div class="MatcDialog" ref="dialog">
      <ScriptEdior :app="app" @change="onChange" :value="selectedWidget" v-if="selectedWidget" @run="store" />
    </div>

  </div>
</template>


<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>


  .MatcDialog {
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
      overflow: auto;
      margin: 40px;
      background: #fff;
      width: unset;
      display: inline-block;
      padding: 20px;

  }
  .MatcDialog textarea {
        height: 400px;
        width: 700px;
   }    

   .MatcToolbarTabsBig a {
    color:#333
   }

   .MatcToolbarTabsBig a:hover {
    color:#333
   }

   .MatcScriptEditor {
    height: 400px;
   }
</style>
<style lang="scss">
@import '../style/toolbar/tab.scss';
</style>
<style lang="sass">
  @import "../style/bulma.sass"
</style>


<script>


//import Logger from '../core/Logger'
import SandBoxService from '../core/engines/ScriptEngine'
import app from './data/scriptTest.json'
import ScriptEdior from '../canvas/toolbar/dialogs/ScriptEditor.vue'
import * as DojoUtil from 'dojo/DojoUtil'

//app.type = 'desktop'

export default {
  name: "JSSandboxTest",
  mixins: [],
  data: function() {
    return {
        js: `
function myFunc() {
  console.debug('a was called')
}
let a = data.a * 1
let b = data.b * 1
console.debug('c:' + data.c)
let c = a + b
data.c = c
console.debug('a:' + a )
console.debug('b:' + b )
console.debug('c:' + c )
console.debug('end')
let label = qux.getScreen('Screen').getWidget('StatusLabel')
label.setStyle({color:'red'})
label.setLabel('Klaus Was here')

let hide = qux.getScreen('Screen').getWidget('HideMe')
console.debug('hide is ' + hide.isHidden())
if (hide.isHidden()) {
    hide.show()
} else {
    hide.hide()
}
`,
        viewModel: {
            name: 'klaus',
            age: 42,
            sum: 0
        },
        app: app,
        errorMsg: '',
        resultMsg: '',
        selectedWidget: null
    };
  },
  components: {
   ScriptEdior
  },
  computed: {

  },
  methods: {
      store (js) {
          localStorage.setItem('jsSandBoxTest', js)
      },
      async run () {
          const s = new SandBoxService()
          try {
            this.resultMsg = 'Running...'
            const result = await s.run(this.js, this.app, this.viewModel)
            this.resultMsg = result.result
            this.viewModel = result.viewModel
            this.errorMsg = ''
          } catch (error) {
            this.resultMsg = ''
            this.errorMsg = error
          }
      },
      onChange () {

      }
  },
  mounted() {
    //Logger.setLogLevel(4)
    if (localStorage.getItem('jsSandBoxTest')) {
       this.js = localStorage.getItem('jsSandBoxTest')
    }
    var settings = DojoUtil.$new(ScriptEdior);
    console.debug(settings)
    this.selectedWidget = {
      props: {
        script: this.js
      }
    }
  }
};
</script>
