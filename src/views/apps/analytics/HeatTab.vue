<template>
  <div class="MatcTest">
    <section class="section">
      <div class="container">
        <div class="level">
          <div class="level-left"></div>
          <div class="level-right">
            <a
              class="button is-success level-item"
              :href="`#/${urlPrefix}/${app.id}/analyze/workspace.html`"
            >Open Analytic Canvas</a>
          </div>
        </div>

        <HeatList :app="app" :pub="isPublic" :events="events" v-if="events && events.length > 0" />

        <div v-if="loading" class="MatcHint">
            Loading...
        </div>
       
      </div>
    </section>



    <section class="section" v-if="!loading && events.length === 0">
      <div class="container">
        <div class="box is-shadowless MatcWarningBox">
          <h2 class="title">No data</h2>
          <p>
            You have not performed any test yet, therefore Quant-UX could not collect any data. Once you start testing,
            you can will see here the heat maps.
          </p>
        </div>
      </div>
    </section>
        

    
    
    <AnalyticPagePlugin  v-if="events && events.length === 0" :events="event" :model="app" />

    <section class="section">
      <div class="container">
        <div class="box is-shadowless">
          <h2 class="title">Comments</h2>
          <Comment
            v-if="app"
            :appID="app.id"
            type="overview_heat"
            reference
            contentID
            insertPosition="top"
          />
        </div>
      </div>
    </section>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Plan from "page/Plan";
import Util from "core/Util";
import Comment from "page/Comment";
import HeatList from "dash/HeatList";
import AnalyticPagePlugin from "../../../plugins/AnalyticPagePlugin"

export default {
  name: "Test",
  mixins: [DojoWidget, Plan, Util],
  props: ["app", "test", "annotation", "events", "pub", "loading"],
  data: function() {
    return {
      MIN_REQUIERED_USERS: 40,
      summary: {}
    };
  },
  components: {
    Comment: Comment,
    HeatList: HeatList,
    AnalyticPagePlugin: AnalyticPagePlugin
  },
  computed: {
    isPublic() {
      return this.$route.meta && this.$route.meta.isPublic;
    },
    urlPrefix() {
      if (this.isPublic) {
        return "examples";
      }
      return "apps";
    }
  },
  methods: {},
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

