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
        <div class="MatcLoading@" v-else>
          You have not performed any test and we could not collect any data yet. Once you start testing,
          you can will see here the heat maps.
        </div>
      </div>
    </section>
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

