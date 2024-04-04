<template>


  <div class="MatcLight" >
    <span @click="visible = !visible">Start </span>
    <div v-if="model && visible" class="MatcCanvasContainer">
      <div class="MatcCanvasLayer">
        <div v-for="s in screens" :key="s.id" class="MatcScreen MatcBox" :style="pos(s)">

        </div>
      </div>
     <div class="MatcCanvasLayer">
        <div v-for="w in widgets" :key="w.id" class="MatcWidget MatcBox" :style="pos(w)">
          <component :is="w.type" :qWidget="w" :qQcaleX="1"/>
        </div>
     </div>
    </div>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

  .MatcBox{

  }

  .MatcScreen{
    background: #fff;
  }
  .MatcTReeCntr {
      background: #f2f2f2;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      display: inline-block;
      padding: 5px;
      width: 250px;
      height: 400px;
      overflow: scroll;
      margin-left: 30px;
      font-size: 14px;
  }
  .MatcPreviewCntr {
      background: #f2f2f2;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
      display: inline-block;
      width: 250px;
      height: 400px;
      overflow: scroll;
      margin-left: 30px;
      font-size: 14px;
      vertical-align: top;
      overflow: auto;
      border-radius: 10px;
  }
</style>

<script>

import app from './data/app_big.json'

import CheckBoxWidget from 'core/widgets/CheckBoxWidget'
//import RadioBox from 'core/widgets/RadioBox'
import RadioBox2 from 'core/widgets/RadioBox2'
import SwitchWidget from 'core/widgets/SwitchWidget'
import DropDown from 'core/widgets/DropDown'
import TextBox from 'core/widgets/TextBox'
import Password from 'core/widgets/Password'
import TextArea from 'core/widgets/TextArea'
import Button from 'core/widgets/Button'
//import DragNDrop from 'core/widgets/DragNDrop'
//import Spinner from 'core/widgets/Spinner'
import QDate from 'core/widgets/QDate'
import QDateDropDown from 'core/widgets/QDateDropDown'
import HSlider from 'core/widgets/HSlider'
import TableWidget from 'core/widgets/TableWidget'
import SegmentButton from 'core/widgets/SegmentButton'
import ToggleButton from 'core/widgets/ToggleButton'
// import LogicOr from 'core/widgets/LogicOr'
// import PolyLine from 'core/widgets/PolyLine'
// import VolumeSlider from 'core/widgets/VolumeSlider'
// import ImageCarousel from 'core/widgets/ImageCarousel'
import Rating from 'core/widgets/Rating'
import IconToggle from 'core/widgets/IconToggle'
import Stepper from 'core/widgets/Stepper'
// import MobileDropDown from 'core/widgets/MobileDropDown'
import TypeAheadTextBox from 'core/widgets/TypeAheadTextBox'
import Label from 'core/widgets/Label'
import Chart from 'core/widgets/Chart'
// import HoverDropDown from 'core/widgets/HoverDropDown'
import CheckBoxGroup from 'core/widgets/CheckBoxGroup'
import RadioGroup from 'core/widgets/RadioGroup'
// import LabeledIconToggle from 'core/widgets/LabeledIconToggle'
// import Rest from 'core/widgets/Rest'
// import Vector from 'core/widgets/Vector'
// import Sketch from 'core/widgets/Sketch'
import Repeater from 'core/widgets/Repeater'
// import Upload from 'core/widgets/Upload'
import UploadPreview from 'core/widgets/UploadPreview'
// import WebLink from 'core/widgets/WebLink'
// import ProgressBar from 'core/widgets/ProgressBar'
// import ScreenSegment from 'core/widgets/ScreenSegment'
// import CountingStepper from 'core/widgets/CountingStepper'
// import Tree from 'core/widgets/Tree'
//import IconButton from 'core/widgets/IconButton'
import Paging from 'core/widgets/Paging'

import Vue from 'vue'

export default {
  name: "FigmaTest",
  mixins: [],
  data: function() {
    return {
        visible: false,
        previews: [],
        model: null
    };
  },
  components: {
  },
  computed: {
    screens () {
      if (this.model) {
        return Object.values(this.model.screens)
      }
      return null
    },
    widgets () {
      /**
       * Sorted....
       */
      return Object.values(this.model.widgets)
    }
  },
  methods: {
    init () {
      Vue.component('qButton', Button);
      Vue.component('qBox', Button)
      Vue.component('qLabel', Label);
      Vue.component('qContainer', Button)
      Vue.component('qIcon', Button)
      Vue.component('qTextBox', TextBox)
      Vue.component('qPassword', Password)
      Vue.component('qTextArea', TextArea)
      Vue.component('qRepeater', Repeater)
      Vue.component('qImage', UploadPreview)
      Vue.component('qUploadPreview', UploadPreview)

      Vue.component('qCheckBox', CheckBoxWidget)
      Vue.component('qRadioBox', RadioBox2)
      Vue.component('qRadioBox2', RadioBox2)
      Vue.component('qRadioGroup', RadioGroup)
      Vue.component('qCheckBoxGroup', CheckBoxGroup)
      Vue.component('qToggleButton', ToggleButton)
      Vue.component('qSwitch', SwitchWidget)
      Vue.component('qDropDown', DropDown)
      Vue.component('qMobileDropDown', DropDown)
      Vue.component('qStepper', Stepper)
      Vue.component('qHSlider', HSlider)
      Vue.component('qDate', QDate)
      Vue.component('qDateDropDown', QDateDropDown)
      Vue.component('qSegmentButton', SegmentButton)
      Vue.component('qRating', Rating)
      Vue.component('qIconToggle', IconToggle)
      Vue.component('qLabeledIconToggle', IconToggle)
      Vue.component('qTypeAheadTextBox', TypeAheadTextBox)
      Vue.component('qTable', TableWidget)
      Vue.component('qPaging', Paging)
      Vue.component('qBarChart', Chart)
      Vue.component('qPieChart', Chart)
      Vue.component('qMultiRingChart', Chart)
      Vue.component('qRingChart', Chart)
      Vue.component('qWebLink', Button)
    },
    pos (w) {
      return {
        width: w.w + 'px',
        height: w.h + 'px',
        top: w.y + 'px',
        left: w.x + 'px'
      }
    },
    async run() {
      Object.values(this.model.widgets).forEach(w => {
        w.type = 'q' + w.type
      })
    }
  },
  mounted() {
    this.init()
    this.model = app
    this.run()
  }
};
</script>
