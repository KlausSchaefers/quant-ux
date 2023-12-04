
<template>
    <div :class="['StudioColorDropDown MatcIconDropDown', {'MatcIconDropDownVisible': isVisible}]">
       <a type="button" ref="button" @click.stop="open" class="StudioColorDropDownDot" >
        
       </a>
       <div class="MatcIconDropDownPopUp" role="menu" data-dojo-attach-point="popup" v-if="isVisible">
         <ul class role="menu" data-dojo-attach-point="ul">
           <li v-for="ln in languages" :key="ln.value" @click.stop="onChangeLanguage(ln.value)" ><a>{{ln.label}}</a>
           </li>
         </ul>
       </div>
       <div class="MatcDropDownPopUpBackdrop" v-if="isVisible"></div>
     </div>
   </template>
    
    <style lang="scss">
    @import "../style/components/icon_drop_down.scss";
  </style>
  <script>
  import on from "dojo/on";
  import win from "dojo/_base/win";
  import _Tooltip from 'common/_Tooltip'
  export default {
    name: "Design",
    mixins: [_Tooltip],
    data: function () {
      return {
        isVisible: false
      };
    },
    components: {
    },
    computed: {
  
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
      this.addTooltip(this.$refs.button, this.$t('tooltip.app-color'))
    }
  };
  </script>
    