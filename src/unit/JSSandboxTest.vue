<template>
  <div class="MatcLight">
    <h1>JS Sandbox Test</h1>

   <div class="MatcDialog">
   
       <textarea v-model="js" class="form-control" @change="store"/>
       <button class="MatcButton" @click="run">Run</button>
    </div>
  </div>
</template>

<style>
  @import url("../style/matc.css");
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
</style>

<style lang="sass">
  @import "../style/bulma.sass"
</style>


<script>


import Logger from '../core/Logger'
import SandBoxService from '../services/SandboxService'


export default {
  name: "JSSandboxTest",
  mixins: [],
  data: function() {
    return {
        js: `
console.debug('aaa')
console.debug(qux)
qux.save()
var xxx = 'xxx'
return 1
`,
        viewModel: {
            name: 'klaus',
            age: 42,
            sum: 0
        },
        app: {}
    };
  },
  components: {
   
  },
  computed: {

  },
  methods: {
      store () {
          localStorage.setItem('jsSandBoxTest', this.js)
      },
      run () {
          let s = new SandBoxService()
          s.run(this.js, this.app, this.viewModel)
      }
  },
  mounted() {
    Logger.setLogLevel(4)
    if (localStorage.getItem('jsSandBoxTest')) {
       // this.js = localStorage.getItem('jsSandBoxTest')
    }
  }
};
</script>
