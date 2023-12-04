
<template>
  <div :class="['StudioColorDropDown MatcIconDropDown', {'MatcIconDropDownVisible': isVisible}]">
     <div type="button" ref="button" @click.stop="open" class="StudioColorDropDownDot" :style="{'background': value}" >
      
     </div>
     <div class="MatcDropDownPopUp " role="menu" data-dojo-attach-point="popup" v-if="isVisible">
        <div class="StudioColorDropDownCntr">
          <div v-for="(c,i) in colors" class="StudioColorDropDownDot" :style="{'background': c}" :key="i" @click="select(c)"></div>
        </div>

     </div>
     <div class="MatcDropDownPopUpBackdrop" v-if="isVisible" @click="close"></div>
   </div>
 </template>
  
  <style lang="scss">
  @import "../../style/components/icon_drop_down.scss";
</style>
<script>
import _Tooltip from 'common/_Tooltip'
export default {
  name: "Design",
  mixins: [_Tooltip],
  props: ['color'],
  data: function () {
    return {
      value: '#365fff',
      isVisible: false,
      colors: [
        '#333', '#777', '#999',
        '#365fff', '#6e97f6', '#98b4f3',
        '#cb2cf3', '#d258f1', '#dd89f2',
        '#ef3149', '#f45e71', '#f78896',
        '#32d315', '#62d74d', '#91de83', 
        '#f6d310', '#f6df5f', '#f3e89c'
      ]
    };
  },
  components: {
  },
  computed: {

  },
  methods: {
    open () {
      this.isVisible = true
    },
    close() {
      this.isVisible = false
    },
    select (c) {
      this.value = c
      this.$emit('change', c)
      this.close()
    }
  },
  watch: {
    color (v) {
      this.value = v
    }
  },
  async mounted() {
    this.addTooltip(this.$refs.button, this.$t('tooltip.app-color'))
    if (this.color) {
      this.value = this.color
    }
  }
};
</script>
  