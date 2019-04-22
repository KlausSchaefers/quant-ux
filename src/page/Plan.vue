
<template>
  <div ref="containerNode"></div>
</template>
<script>
export default {
  name: "Form",
  mixins: [],
  data: function() {
    return {
      plans: {
        Free : {
            apps: -1,
            team: -1,
            tasks: -1,
            test: -1,
            price: 0,
            name: "Free",
            des: "<b>Free</b> as the wind...",
            updateEmail: "The Free plan includes....",
            updateEmailHTML: "The <b>Freelancer</b> plan includes....",
            embed: true
            }
        },
        currenUserPlan: 'Free'
    }
  },
  components: {},
  methods: {
    getPlans() {
      return this.plans;
    },

    setUserPlan(p) {
      this.currenUserPlan = p;
    },

    getPlanByName(plan) {
      return this.plans[plan];
    },

    getUserPlan() {
      return "Free";
    },

    planCanShare(team) {
      if (team) {
        var plans = this.getPlans();
        var userPlan = this.getUserPlan();
        if (plans[userPlan] !== undefined && plans[userPlan] != null) {
          var max = plans[userPlan].team;
          // if -1 there is no limit
          if (max < 0) {
            return true;
          }
          // else check
          return team.length < max;
        } else {
          console.error("planCanShare() > Not supported pplan ", userPlan);
        }
      }
      return true;
    },

    planCanCreate() {
      var plans = this.getPlans();
      var userPlan = this.getUserPlan();
      if (plans[userPlan] !== undefined && plans[userPlan] != null) {
        var max = plans[userPlan].apps;
        // if -1 there is no limit
        if (max < 0) {
          return true;
        }
        var stats = this._doGet("/rest/user/plan/consumption.json");
        if (stats) {
          return stats.appOwner < max;
        }
      } else {
        console.error("planCanCreate() > Not supported pplan ", userPlan);
      }
      return true;
    },

    planCanAddTask(test) {
      //console.debug("planCanAddTask()", test);
      var plans = this.getPlans();
      var userPlan = this.getUserPlan();
      if (plans[userPlan] !== undefined && plans[userPlan] != null) {
        var max = plans[userPlan].tasks;
        //console.debug("planCanAddTask()", userPlan, max, test.tasks.length);
        // if -1 there is no limit
        if (max < 0) {
          return true;
        }
        if (test && test.tasks) {
          return test.tasks.length < max;
        }
      } else {
        console.error("planCanAddTask() > Not supported pplan ", userPlan);
      }
      return true;
    },

    planCanEmbed() {
      var plans = this.getPlans();
      var userPlan = this.getUserPlan();
      if (plans[userPlan] !== undefined && plans[userPlan] != null) {
        return plans[userPlan].embed;
      } else {
        console.error("planCanEmbed() > Not supported plan ", userPlan);
      }
      return false;
    },

    planGetTestCount() {
      var plans = this.getPlans();
      var userPlan = this.getUserPlan();
      if (plans[userPlan] !== undefined && plans[userPlan] != null) {
        return plans[userPlan].test;
      } else {
        console.error("planGetTestCount() > Not supported pplan ", userPlan);
      }
      return -1;
    },

    planFilterEvents(events) {
      var max = this.planGetTestCount();
      if (max >= 0) {
        events.sort(function(a, b) {
          return a.time - b.time;
        });
        var result = [];
        var includedSessions = {};
        var sessionCount = 0;
        for (var i = 0; i < events.length; i++) {
          var e = events[i];
          //console.debug(e);
          if (sessionCount < max) {
            if (!includedSessions[e.session]) {
              includedSessions[e.session] = true;
              sessionCount++;
            }
          }
          if (includedSessions[e.session]) {
            result.push(e);
          }
        }
        return result;
      }
      return events;
    }
  },
  mounted() {
  }
};
</script>