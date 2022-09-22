
<template>
  <div class="MatcLanguagePicker">
    <div type="button" data-dojo-attach-point="button" @click.stop="open"  >
      <span v-if="hasLabel">
        {{selectedLanguage}}
      </span>
      <span data-dojo-attach-point="label" class="mdi mdi-earth"></span>
      <span class="caret" v-if="hasCarret"></span>
    </div>
    <div class="MatcDropDownPopUp" role="menu" data-dojo-attach-point="popup" v-if="isVisible">
      <ul class role="menu" data-dojo-attach-point="ul">
        <li v-for="ln in languages" :key="ln.value" @click.stop="onChangeLanguage(ln.value)" ><a>{{ln.label}}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
<style lang="scss">
  @import "../style/language.scss";
</style>
<script>
//import Services from "services/Services";
import on from "dojo/on";
import win from "dojo/_base/win";
import Logger from "common/Logger";

export default {
  name: "LangaugePicker",
  props:['hasLabel', 'value'],
  mixins: [],
  data: function() {
    return {
      isVisible: false,
      hasCarret: false,
      language: 'en',
      languages: [
        {
          label: "English",
          value: "en"
        },
        {
          label: "Chinese",
          value: "cn"
        },
        {
          label: "Deutsch",
          value: "de"
        },
        {
          label: "Portuguese",
          value: "pt"
        }
      ]
    };
  },
  components: {
  },
  computed: {
    selectedLanguage () {
      const ln = this.languages.find(l => l.value === this.language)
      if (ln) {
        return ln.label
      }
      return ''
    }
  },
  methods: {
    open () {
      this.isVisible = true
      this._mouseDownListener = on(win.body(), "click", e => {
        this.close(e)
      })
    },
    close() {
      this.isVisible = false
    },
    onChangeLanguage (language) {
      this.language = language
      this.logger.log(-1, "onChangeLanguage", "entry", language);
      this.$emit('change', language)
      this.close()
    }
  },
  async mounted() {
    this.logger = new Logger("LangaugePicker");
    if (this.value) {
      this.language = this.value
    }
  }
};
</script>