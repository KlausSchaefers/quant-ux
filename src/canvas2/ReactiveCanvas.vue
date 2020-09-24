<template>
  <div :class="'MatcCanvas MatcCanvasMode' + this.mode" @mousewheel="onMouseWheel" @mousedown="onCanvasMouseDown">

    <div class="MatcCanvasFrame">
      <div class="MatcCanvasContainer MatcCanvasZoomable " ref="container" :style="containerPosition">
        <div ref="screenContainer" class="MatcCanvasLayer">
					<div v-for="screen in screens" :key="screen.id + '_render'" class="MatcBox MatcScreen" :style="getPosition(screen) + getBackground(screen)">
					</div>
					<div v-for="widget in widgets" :key="widget.id + '_render'" class="MatcBox MatcWidget" :style="getPosition(widget)">
						<component :is="getWidgetType(widget)" :qWidget="widget" />
					</div>
				</div>
        <div data-dojo-attach-point="widgetContainer" class="MatcCanvasLayer" v-if="hasDND">
						<div v-for="screen in screens" :key="screen.id" class="MatcBox MatcScreenDnD" :style="getPosition(screen)" @mousedown="onScreenMouseDown"/>
						<div v-for="widget in widgets" :key="widget.id" class="MatcBox MatcWidgetDND" :style="getPosition(widget)" @mousedown="onWidgetMouseDown"/>
				</div>
      </div>
    </div>
    <div class="MatcCanvasScrollBar MatcCanvasScrollBarRight" data-dojo-attach-point="scrollRight">
      <div class="MatcCanvasScrollBarCntr MatcCanvasScrollBarCntrRight" data-dojo-attach-point="scrollRightCntr">
        <div class="MatchCanvasScrollHandle" data-dojo-attach-point="scrollRightHandler"></div>
      </div>
    </div>
    <div class="MatcCanvasScrollBar MatcCanvasScrollBarBottom" data-dojo-attach-point="scrollBottom">
      <div class="MatcCanvasScrollBarCntr MatcCanvasScrollBarCntrBottom" data-dojo-attach-point="scrollBottomCntr">
        <div class="MatchCanvasScrollHandle" data-dojo-attach-point="scrollBottomHandler"></div>
      </div>
    </div>
    <!-- Status -->
    <div class="MatcMessage" data-dojo-attach-point="message">
    </div>
  </div>
</template>

<script>

import Logger from 'core/Logger'
import win from "dojo/win"
import css from 'dojo/css'

/**
 * Reactive Widgets
 */
import Label from './widgets/rLabel'
import Button from './widgets/rButton'
import Icon from './widgets/rIcon'
/**
 * Old Widgets
 */
//import Button from 'core/widgets/Button'
import QImage from 'core/widgets/QImage'
import CheckBoxWidget from 'core/widgets/CheckBoxWidget'
import RadioBox from 'core/widgets/RadioBox'
import RadioBox2 from 'core/widgets/RadioBox2'
import SwitchWidget from 'core/widgets/SwitchWidget'
import DropDown from 'core/widgets/DropDown'
import TextBox from 'core/widgets/TextBox'
import Password from 'core/widgets/Password'
import TextArea from 'core/widgets/TextArea'
import DragNDrop from 'core/widgets/DragNDrop'
import Spinner from 'core/widgets/Spinner'
import QDate from 'core/widgets/QDate'
import QDateDropDown from 'core/widgets/QDateDropDown'
import HSlider from 'core/widgets/HSlider'
import TableWidget from 'core/widgets/TableWidget'
import SegmentButton from 'core/widgets/SegmentButton'
import ToggleButton from 'core/widgets/ToggleButton'
import LogicOr from 'core/widgets/LogicOr'
import VolumeSlider from 'core/widgets/VolumeSlider'
import ImageCarousel from 'core/widgets/ImageCarousel'
import Rating from 'core/widgets/Rating'
import IconToggle from 'core/widgets/IconToggle'
import Stepper from 'core/widgets/Stepper'
import MobileDropDown from 'core/widgets/MobileDropDown'
import TypeAheadTextBox from 'core/widgets/TypeAheadTextBox'
import Chart from 'core/widgets/Chart'
import HoverDropDown from 'core/widgets/HoverDropDown'
import CheckBoxGroup from 'core/widgets/CheckBoxGroup'
import RadioGroup from 'core/widgets/RadioGroup'
import LabeledIconToggle from 'core/widgets/LabeledIconToggle'
import Rest from 'core/widgets/Rest'
import Vector from 'core/widgets/Vector'
import Repeater from 'core/widgets/Repeater'
import Upload from 'core/widgets/Upload'
import UploadPreview from 'core/widgets/UploadPreview'
import WebLink from 'core/widgets/WebLink'
import ProgressBar from 'core/widgets/ProgressBar'
import ScreenSegment from 'core/widgets/ScreenSegment'
import CountingStepper from 'core/widgets/CountingStepper'
import Tree from 'core/widgets/Tree'
import IconButton from 'core/widgets/IconButton'
import Paging from 'core/widgets/Paging'
import Timeline from 'core/widgets/Timeline'

import CoreUtil from '../core/CoreUtil'
import DomUtil from '../core/DomUtil'

/**
 * Mixins
 */
import CanvasEvents from './mixins/CanvasEvents'

/**
import Render from 'canvas/Render'
import Lines from 'canvas/Lines'
import DnD from 'canvas/DnD'
import Add from 'canvas/Add'
import Select from 'canvas/Select'
import Distribute from 'canvas/Distribute'
import Tools from 'canvas/Tools'
import Zoom from 'canvas/Zoom'
import Util from 'core/Util'
import InlineEdit from 'canvas/InlineEdit'
import Scroll from 'canvas/Scroll'
import Upload from 'canvas/Upload'
import Comment from 'canvas/Comment'
import Layer from 'canvas/Layer'
import DataView from 'canvas/DataView'

import ScreenRuler from 'canvas/ScreenRuler'
import CustomHandler from 'canvas/CustomHandler'
*/
// import DomUtil from 'core/DomUtil'

export default {
	name: 'ReactiveCanvas',
	props: ['value', 'isPublic', 'user', 'modelService', 'commentService', 'controller', 'renderFactory', 'modelFactory'],
	mixins:[CanvasEvents],
    data: function () {
        return {
					mode: "edit",
					fullModel: null,
          debug: false,
          grid: null,
					active: true,
					model: null,
					hasDND: false,
					zoom: 1,
					zoomLevels: [0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 2],
          zoomLevelPos: 3
        }
    },
	components: {
		'qButton': Button,
		'qImage': QImage,
		'qCheckBoxWidget':  CheckBoxWidget,
		'qRadioBox':  RadioBox,
		'qRadioBox2':  RadioBox2,
		'qSwitchWidget':  SwitchWidget,
		'qDropDown':  DropDown,
		'qTextBox':  TextBox,
		'qPassword':  Password,
		'qTextArea':  TextArea,
		'qDragNDrop':  DragNDrop,
		'qSpinner':  Spinner,
		'qQDate':  QDate,
		'qQDateDropDown': QDateDropDown,
		'qHSlider':  HSlider,
		'qTableWidget':  TableWidget,
		'qSegmentButton':  SegmentButton,
		'qToggleButton':  ToggleButton,
		'qLogicOr':  LogicOr,
		'qVolumeSlider':  VolumeSlider,
		'qImageCarousel':  ImageCarousel,
		'qRating':  Rating,
		'qIconToggle':  IconToggle,
		'qStepper':  Stepper,
		'qMobileDropDown':  MobileDropDown,
		'qTypeAheadTextBox':  TypeAheadTextBox,
		'qLabel':  Label,
		'qChart':  Chart,
		'qHoverDropDown':  HoverDropDown,
		'qCheckBoxGroup':  CheckBoxGroup,
		'qRadioGroup':  RadioGroup,
		'qRest':  Rest,
		'qVector':  Vector,
		'qRepeater':  Repeater,
		'qUploadPreview':  UploadPreview,
		'qUpload':  Upload,
		'qWebLink':  WebLink,
		'qProgressBar':  ProgressBar,
		'qScreenSegment':  ScreenSegment,
		'qCountingStepper':  CountingStepper,
		'qTree':  Tree,
		'qIconButton':  IconButton,
		'qPaging':  Paging,
		'qTimeline':  Timeline,
		'qLabeledIconToggle': LabeledIconToggle,
		'qIcon': Icon
	},
	computed: {
		screens () {
			if (this.model) {
				return Object.values(this.model.screens)
			}
			return []
		},
		widgets () {
			if (this.model) {
				// get ordered
				return CoreUtil.getOrderedWidgets(this.model.widgets).map(w => {
					w._zoom = this.zoom
					return w
				})
			}
			return []
		},
		containerPosition () {
			let box = this.canvasPos
			return `width: ${this.getZoomed(box.w)}px; height: ${this.getZoomed(box.h)}px; left:${box.x}px; top:${box.y}px;`
		}
	},
  methods: {

		render () {
			Logger.log(-1, 'ReactiveCanvas.render() > enter')
			this.setModel(this._model)
		},

		getWidgetType (w) {
			return 'q' + w.type
		},

		setModel (model) {
			this._model = model
			/**
			 * Check out if it would not be faster to not do this, but
			 */
			this.model = CoreUtil.createZoomedModel(this.zoom, this.zoom, false, model)

			let types = {}
			Object.values(this.model.widgets).forEach(w => types[w.type] = types[w.type] ? types[w.type] +1 : 1)
			console.debug(types)
			Logger.log(-1, 'ReactiveCanvas.setModel() > exit', model)
		},

		/***************************************************************************
		* Basic CSS for layouting
		***************************************************************************/
		getPosition (box) {
			return `width: ${box.w}px; height: ${box.h}px; left:${box.x}px; top:${box.y}px;`
			//return `width: ${box.w}px; height: ${box.h}px; transform: translate(${box.x}px, ${box.y}px);`
		},
		getBackground (box) {
			return `background:${box.style.background}`
		},


		getZoomed (v) {
			return Math.round(v * this.zoom)
		},

		initSize () {
			/**
			 * Fix with some CSS stuff oncvce for good
			 */
			let height = win.getBox().h
			this.$el.style.height = `${height}px`
			this.domPos = DomUtil.position(this.$el);
		},

		onChangeCanvasViewConfig () {

		},

		showHint () {

		},

		showSuccess () {

		},

		showError () {

		},

		/***************************************************************************
			* Mouse Functons
			***************************************************************************/

		getCanvasMousePosition (e){
			var pos = DomUtil.getMousePosition(e);
			pos.x -= (this.domPos.x + this.canvasPos.x);
			pos.y-= (this.domPos.y + this.canvasPos.y);
			return pos;
		},

		getRelCanvasMousePosition (e){
			var pos = this.getCanvasMousePosition(e);
			pos.x = pos.x / this.getZoomed(this.canvasPos.w);
			pos.y = pos.y / this.getZoomed(this.canvasPos.h);
			return pos;
		},


	},
	watch: {
		value (v) {
			this.setModel(v)
		}
	},
  mounted () {
		this.initSize()
		if (this.value) {
			this.setModel(this.value)
		}
		css.add(win.body(), 'MatcLight')
  }
}
</script>