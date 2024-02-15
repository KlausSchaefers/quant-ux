
<template>
  <div class="MatcButton MatcDropDownButton ">
    <div type="button" ref="button" class="MatcDropDownButtonCntr">
      <QIcon :icon="icon" v-if="icon"/>
      <label data-dojo-attach-point="label" class="MatcDropDownLabel"></label>
      <span class="caret"></span>
    </div>
    <div class="MatcDropDownPopUp MatcDropDownButtonWidth" role="menu" data-dojo-attach-point="popup" >
      <ul class role="menu" data-dojo-attach-point="ul"></ul>
    </div>
  </div>
</template>
<script>
import DropDownButton from "common/DropDownButton";
import QIcon from 'page/QIcon'
export default {
  name: "DropDownButton",
  mixins: [DropDownButton],
  data: function() {
    return {
      openCSS: "MatcDropDownButtonOpen",
      iconCSS: "MatcDropDownIcon",
      labelCSS: "MatcDropDownLabel",
      selectedCSS: "MatcDropDownButtonSelected",
      liCSS: "MatcDropDownMenuItem"
    };
  },
  components: {
    'QIcon': QIcon
  }
};
</script>