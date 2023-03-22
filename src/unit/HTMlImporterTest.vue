<template>
  <div class="MatcPadding" id="">
    <h1>HTML Importer 
    
    </h1>

    <div class="config">
      <ul>
        <li><input  type="checkbox" v-model="hasJSON"> Show JSON</li>
        <li><input  type="checkbox" v-model="isRemoveContainers" @change="run()"> Remove Container</li>
        <li><input  type="checkbox" v-model="isDefaultStyle" @change="run()"> Default style</li>
        
     
      </ul>
    </div>

    <div class="panel">
      <textarea v-model="html" style="">

          </textarea>

      <div class="inner " ref="inner"></div>
      <pre v-if="hasJSON">{{ result }}</pre>
      <div v-if="!hasJSON" class="sim-cntr" ref="simCntr"></div>
    </div>

    <div>
      <button @click="run()">Run</button>
    </div>



  </div>
</template>
    
<style lang="css">
@import url("../style/matc.css");

.panel {
  display: flex;
  gap: 40px
}

textarea,
pre {
  border: 1px solid #333;
  height: 600px;
  flex-grow: 1;
  font-size: 12px;
}

.inner {
  height: 600px;
  width: 400px;
  overflow: hidden;
  border: 1px solid #333;
  border-radius: 16px;
}

.inner.small {
  height: 0px;
  width: 0px;
}

.inner iframe {
  height: 600px;
  width: 400px;
  border: none;
}

.sim-cntr {
  width: 430px;
  height: 600px;
  border: 1px solid red;


}

.MatchWidgetTypeTextBox, .MatcWidgetTypeTextBoxInputForm {
    Xoutline: 1px solid green;
  }

  .XMatcWidgetTypeTextBox {
    height: 100%;
  }

.config {
  position: fixed; 
  top:0px;
  right: 0px;
  background: orange;
  padding: 8px;
  font-size: 10px;
  text-align: left;
  height: 24px;
  width: 24px;
  border-radius: 8px;
  overflow: hidden;
}

.config:hover {
  height: auto;
  width: auto;
}

.config ul {
  opacity: 0;
  list-style: none;
  margin: 0px;
  padding: 0px;
}

.config:hover ul {
  opacity: 1;
}

</style>
    
<script>

import HTMLImporter from '../core/ai/HTMLImporter'
import { html, htmlSmall } from './data/htmlLogin'
import DomBuilder from 'common/DomBuilder'
import domGeom from 'dojo/domGeom'
import ScrollContainer from 'common/ScrollContainer'
import Simulator from 'core/Simulator'
import * as DojoUtil from 'dojo/DojoUtil';

export default {
  name: "home",
  mixins: [],
  data: function () {
    return {
      hasJSON: false,
      isRemoveContainers: false,
      isDefaultStyle: false,
      result: {},
      isSmall: true,
      html: ''
    };
  },
  components: {
  },
  methods: {

    async run() {
      const importer = new HTMLImporter()
      let defaultStyle = null
      if (this.isDefaultStyle) {
        defaultStyle = {
          "fontSize": 14,
          "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
          "textAlign": "left",
          "letterSpacing": 0,
          "lineHeight": 1,
          "color": "#333333",
          "paddingTop": 0,
          "paddingBottom": 0,
          "paddingLeft": 0,
          "paddingRight": 0,
          "borderTopRightRadius": 3,
          "borderTopLeftRadius": 3,
          "borderBottomRightRadius": 3,
          "borderBottomLeftRadius": 3,
          "borderTopWidth": 1,
          "borderBottomWidth": 1,
          "borderRightWidth": 1,
          "borderLeftWidth": 1,
          "verticalAlign": "middle",
          "borderTopColor" : "#333333",
          "borderBottomColor" : "#333333",
          "borderRightColor" : "#333333",
          "borderLeftColor" : "#333333",
          "background" : "#ffffff"
        }
      }
      const [result, tree] = await importer.html2QuantUX(this.html, this.$refs.inner, 400, 600, {
        isRemoveContainers: this.isRemoveContainers,
        defaultStyle: defaultStyle
      })
      //this.result = JSON.stringify(result, null, 2)
      this.result = JSON.stringify(tree, null, 2)
      if (!this.hasJSON) {

        const sim = this.renderSimulator(this.$refs.simCntr)
        sim.doNotRunOnLoadAnimation = true
        sim.doNotExecuteScripts = true
        sim.setModel(result);
      }

    },

    renderSimulator(cntr) {
      cntr.innerHTML = ''

      const db = new DomBuilder();

      const pos = domGeom.position(cntr);
      pos.w -= 30;
    

      const container = db.div("MatchSimulatorContainer MatcAnimationComposerSimulator")
        .h(pos.h)
        .w(pos.w)
        .build();

      const scroller = DojoUtil.$new(ScrollContainer, { canDestroy: true });
      scroller.placeAt(container);

      const s = DojoUtil.$new(Simulator, { mode: "debug", logData: false, runTimerLinesOnScreenLoad: false, isDesktopTest: true, isWiringEvents: true });
      s.scrollListenTarget = "parent";
      s.setHash(this.hash)
      /**
       * We do not want to resize the parent.
       * Therefore we replace the method with an empty one
       */
      s.initParent = () => { };

      s.setScrollContainer(scroller);
      scroller.wrap(s.domNode);
      cntr.appendChild(container);
      return s;
    },

  },
  mounted() {

    if (this.isSmall) {
      this.html = htmlSmall
    } else {
      this.html = html
    }
    this.run()
  }
};
</script>
    