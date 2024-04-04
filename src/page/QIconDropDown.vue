
<template>
    <div :class="['MatcIconDropDown', {'MatcIconDropDownVisible': isVisible}]">
       <QIcon @click.stop="open" :icon="icon"/>

       <div class="MatcDropDownPopUp" role="menu" data-dojo-attach-point="popup" v-if="isVisible">
         <ul class role="menu" data-dojo-attach-point="ul">
           <li v-for="o in options" :key="o.value" @click.stop="select(o, $event)" >
              <a>
                <QIcon @click.stop="open" :icon="o.icon" v-if="o.icon"/>
                {{o.label}}
              </a>
           </li>
         </ul>
       </div>
       <div class="MatcDropDownPopUpBackdrop" v-if="isVisible" @click="close"></div>
     </div>
   </template>
    
    <style lang="scss">
    @import "../style/components/icon_drop_down.scss";
  </style>
  <script>

  import QIcon from './QIcon'

  export default {
    name: "QIconDropDown",
    props: ['icon', 'options'],
    mixins: [],
    data: function () {
      return {
        isVisible: false
      };
    },
    components: {
        'QIcon': QIcon
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
      select (o, e) {
        if (o.callback) {
          o.callback(o, e)
        }
        this.$emit('change', o.value)
        this.close()
      }
    },
    async mounted() {
    }
  };
  </script>
    