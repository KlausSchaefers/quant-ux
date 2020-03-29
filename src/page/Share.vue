
<template>
  <div class="MatcShareDialog" @keydown.stop @keyup.stop @keypress.stop>
    <div class="field">
      <label>Test</label>
      <input type="text" class="input" :value="testLink" @focus="select" />
      <a class="MatcShareIcon" :href="testLink" target="_QuantUXTest">
        <span class="mdi mdi-share" />
      </a>
    </div>

    <div class="field">
      <label>Share and Comment</label>
      <input type="text" class="input" :value="shareLink" @focus="select" />
      <a class="MatcShareIcon" :href="shareLink" target="_QuantUXShare">
        <span class="mdi mdi-share" />
      </a>
    </div>

    <div class="field">
      <label>Code Generation</label>
      <input type="text" class="input" :value="`${hash}`" @focus="select" ref="hashInput" />
      <a class="MatcShareIcon" @click="copy" target="_QuantUXShare">
        <span class="mdi mdi-content-copy" />
      </a>
    </div>

    <div class="MatcMarginTop MatcShareRow MatcSharePasswordRow" v-if="hasPassword">
      <CheckBox v-model="needPassword" label="Require Password" />
      <input
        type="text"
        class="form-control password-control"
        :value="`${password}`"
        @focus="select"
        ref="passwordInput"
        v-if="needPassword"
      />
    </div>
  </div>
</template>
<style scoped>
.MatcSharePasswordRow {
  display: flex;
  justify-content: space-between;
  height: 50px;
}

.MatcSharePasswordRow .VommondCheckBoxWrapper {
  width: 250px;
}

.password-control {
  display: inline-block;
  margin-left: 100px;
  flex-grow: 1;
}
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import CheckBox from "common/CheckBox";

export default {
  name: "ShareForm",
  mixins: [DojoWidget],
  data: function() {
    return {
      isPublic: false,
      needPassword: false,
      hasPassword: false,
      invitation: "--- Loading ---"
    };
  },
  components: {
    CheckBox: CheckBox
  },
  computed: {
    base() {
      return location.protocol + "//" + location.host;
    },
    password() {
      if (this.needPassword) {
        let password = this.invitation.substring(this.invitation.length - 8);
        return password;
      }
      return "";
    },
    hash() {
      return this.invitation;
    },
    passwortedHash() {
      if (this.needPassword) {
        return this.invitation.substring(0, this.invitation.length - 8);
      }
      return this.invitation;
    },
    testLink() {
      let testURL = this.base + "/#/test.html?h=" + this.passwortedHash;
      if (this.isPublic) {
        testURL += "&log=false";
      }
      return testURL;
    },
    shareLink() {
      let testURL = this.base + "/#/share.html?h=" + this.hash;
      if (this.isPublic) {
        testURL += "&log=false";
      }
      return testURL;
    }
  },
  methods: {
    setInvitation(inv) {
      this.invitation = inv;
    },
    setPublic(p) {
      this.isPublic = p;
    },
    copy() {
      this.$refs.hashInput.select();
      document.execCommand("copy");
      this.showSuccess("Copied to clipboard");
    },
    copyPassword() {
      this.$refs.passwordInput.select();
      document.execCommand("copy");
      this.showSuccess("Copied to clipboard");
    },
    select(e) {
      if (e.target) {
        e.target.select();
        document.execCommand("copy");
        this.showSuccess("Copied to clipboard");
      }
    }
  },
  mounted() {}
};
</script>