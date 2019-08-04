<template>
  <div class="MatcTest">
    <div class="MatcSection">
      <div class="container">
          <div class="row MatcMarginBottom">
                <div class="col-md-6 " id="">
                    <h2>
                        Heat Maps 
                    </h2>
                </div>
             
                <div class="col-md-6 MatcRight">
                    <a class="MatcButton MatcButtonSignUp MatcButtonGreen" :href="`#/${urlPrefix}/${app.id}/analyze/workspace.html`">Analytic Canvas</a>
                </div>             
                     
        </div>       

         <HeatList :app="app" :pub="isPublic" :events="events" v-if="events && events.length > 0"/>
         <p class="MatcHint" v-else>
           You have not performed any test and we could not collect any data yet. Once you start testing,
           you can will see here the heat maps.
         </p>
      </div>
    </div>
    <div class="MatcSection">
      <div class="container">
        <h2>Comments</h2>
        <Comment v-if="app" :appID="app.id" type="overview_heat" reference="" contentID="" insertPosition="top"/>
      </div>
    </div>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Plan from 'page/Plan'
import Util from 'core/Util'
import Comment from 'page/Comment'
import HeatList from 'dash/HeatList'

export default {
  name: "Test",
  mixins: [DojoWidget, Plan, Util],
  props: ["app", "test", "annotation", "events", "pub"],
  data: function() {
    return {
      MIN_REQUIERED_USERS: 40,
      summary: {}      
    };
  },
  components: {
    Comment: Comment,
    HeatList: HeatList
  },
  computed: {
    isPublic () {
      return this.$route.meta && this.$route.meta.isPublic
    },
    urlPrefix () {
      if (this.isPublic) {
        return 'examples'
      }
      return 'apps'
    }
  },
  methods: {
   
  },
  watch: {
    test(v) {
      this.logger.info("watch", "test >", v);
      this.test = v;
    }
  },
  async mounted() {
    this.logger = new Logger("AnalyticsTab");
    this.logger.info("mounted", "exit");
  }
};
</script>

