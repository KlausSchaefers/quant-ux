<template>
  <div class="MatcPadding" id="">
    <h1>HTML Importer <input  type="checkbox" v-model="hasJSON"> </h1>

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
  width: 400px;
  height: 600px;
  border: 1px solid red;


}

.MatchWidgetTypeTextBox, .MatcWidgetTypeTextBoxInputForm {
    Xoutline: 1px solid green;
  }

  .MatcWidgetTypeTextBox {
    height: 100%;
  }

</style>
    
<script>

import HTMLImporter from '../core/ai/HTMLImporter'
import { html } from './data/htmlLogin'
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
      result: {},
      html: html
    };
  },
  components: {
  },
  methods: {

    async run() {
      const importer = new HTMLImporter()
      let result = await importer.html2QuantUX(this.html, this.$refs.inner, 400, 600)
      this.result = JSON.stringify(result, null, 2)
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
    this.run()
  }
};
</script>
    