
<template>
    <div :class="['MatcToolbarDropDownButton MatcToolbarArrowDropDown MatcToolbarViewConfig']" @mousedown.stop="showPopup"
        @mouseup.stop="">

        <div :class="['MatcToolbarItem MatcToolbarPrimaryItem', { 'MatcToolbarItemActive': hasPopup }]" type="button"
            ref="button">
            <label class="MatcToolbarLabel"> {{ zoomFactor }} %</label>
            <span class="caret"></span>
        </div>

        <div class=" MatcToolbarPopUp MatcToolbarPopUpOpen MatcToolbarViewConfigPopup" role="menu" v-if="hasPopup"
            @mouseup.stop="" @mousedown.stop="">
            <!--
            <div class="MatcToolbarPopUpArrowCntr">
                <div class="MatcToolbarPopUpArrow"></div>
           </div>
           -->
            <div class=" MatcToolbarPopUpWrapper">
                <div class="MatcToolbarViewConfigCntrSpace">
                    <div class="MatcToolbarViewConfigCntrRow MatcToolbarViewConfigBtn" @mouseup.stop="" @click.stop=""
                        @mousedown.stop="onZoomMinus">
                        Zoom out (-)
                    </div>
                    <div class="MatcToolbarViewConfigCntrRow MatcToolbarViewConfigBtn" @mousedown.stop="onZoomPlus"
                        @mouseup.stop="" @click.stop="">
                        Zoom in (+)
                    </div>
                    <div class="MatcToolbarViewConfigCntrRow MatcToolbarViewConfigBtn" @mousedown.stop="onZoom(3)"
                        @mouseup.stop="" @click.stop="">
                        50%
                    </div>
                    <div class="MatcToolbarViewConfigCntrRow MatcToolbarViewConfigBtn" @mousedown.stop="onZoom(5)"
                        @mouseup.stop="" @click.stop="">
                        100%
                    </div>
                    <div class="MatcToolbarViewConfigCntrRow MatcToolbarViewConfigBtn" @mousedown.stop="onZoom(6)"
                        @mouseup.stop="" @click.stop="">
                        200%
                    </div>
                </div>


                <div v-if="analytic == true">

                    <div class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Lines" :value="hasLines" @change="onChangeLines" />
                    </div>

                    <div class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Comments" :value="hasComments" @change="onChangeComments" />
                    </div>

                    <div class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Gray Scale" :value="hasBW" @change="onChangeBW" />
                    </div>

                </div>
                <div v-else>
                    <div @mousedown="showGrid" class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Snapp to Grid" :value="hasGrid" @change="onChangeGrid" />
                    </div>

                    <div @mousedown="showGrid" class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Show Grid" :value="hasVisibleGrid" @change="onChangeVisibleGrid" />
                    </div>

                    <div @mousedown="showGrid"
                        class="MatcToolbarViewConfigCntrSpace MatcToolbarViewConfigCntrRow MatcToolbarViewConfigBtn">
                        <QIcon icon="Settings" />
                        <span class="MatcStatusItemLabel">Configure Grid</span>
                    </div>

                    <div class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Layers" :value="hasLayers" @change="onChangeLayer" />
                    </div>

                    <div class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Distance" :value="hasDistance" @change="onChangeDistance" />
                    </div>

                    <div class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Ruler" :value="hasRuler" @change="onChangeRuler" />
                    </div>

                    <div class="MatcToolbarViewConfigCntrRow">
                        <CheckBox label="Comments" :value="hasComments" @change="onChangeComments" />
                    </div>
                </div>
            </div> <!-- end MatcToolbarPopUpWrapper-->

            <div class="MatcToolbarPopUpArrowCntr">
                <div class="MatcToolbarPopUpArrow">
                </div>
            </div>
        </div>
    </div>
</template>
<script>

import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import topic from 'dojo/topic'
import Logger from 'common/Logger'
import win from 'dojo/win'
import CheckBox from 'common/CheckBox'
import QIcon from 'page/QIcon'

export default {
    name: 'ViewConfig',
    mixins: [],
    props: ['value', 'analytic'],
    data: function () {
        return {
            hasPopup: false,
            zoomLevels: [0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 2],
            zoomLevelPos: 3,
            hasIcon: false
        }
    },
    computed: {
        gridLabel() {
            if (this.value && this.value.grid) {
                if (this.value.grid.type === 'grid') {
                    return `${this.value.grid.w} x ${this.value.grid.h}`
                }
            }
            return ''
        },
        zoomFactor() {
            if (this.value && this.value.zoom) {
                return Math.round(this.value.zoom * 100)
            }
            return '-'
        },
        hasLines() {
            if (this.value) {
                return this.value.renderLines
            }
            return true
        },
        hasDistance() {
            if (this.value) {
                return this.value.showDistance
            }
            return true
        },
        hasComments() {
            if (this.value) {
                return this.value.showComments
            }
            return true
        },
        hasRuler() {
            if (this.value) {
                return this.value.showRuler
            }
            return true
        },
        hasData() {
            if (this.value) {
                return this.value.hasDataView
            }
            return true
        },
        hasLayers() {
            if (this.value) {
                return this.value.layerListVisible
            }
            return false
        },
        hasBW() {
            if (this.value) {
                return this.value.isBlackAndWhite
            }
            return false
        },
        hasGrid() {
            if (this.value) {
                return this.value.hasGrid
            }
            return false
        },
        hasVisibleGrid() {
            if (this.value) {
                return this.value.hasVisibleGrid
            }
            return false
        }
    },
    components: {
        'CheckBox': CheckBox,
        'QIcon': QIcon
    },
    methods: {
        showGrid() {
            this.$emit('change', 'showGrid', this.$el)
        },

        onChangeVisibleGrid(value) {
            this.log.log(-1, 'onChangeVisibleGrid', 'enter', value)
            this.value.hasVisibleGrid = value
            //this.hideMaybe()
            this.$emit('change', 'hasVisibleGrid', value)
        },

        onChangeGrid(value) {
            this.log.log(-1, 'onChangeGrid', 'enter', value)
            this.value.hasGrid = value
            //this.hideMaybe()
            this.$emit('change', 'hasGrid', value)
        },

        onChangeBW(value) {
            this.log.log(-1, 'onChangeBW', 'enter', value)
            this.value.isBlackAndWhite = value
            //this.hideMaybe()
            this.$emit('change', 'isBlackAndWhite', value)
        },

        onChangeLayer(value) {
            this.log.log(-1, 'onChangeLayer', 'enter', value)
            this.value.layerListVisible = value
            //this.hideMaybe()
            this.$emit('change', 'layerListVisible', value)
        },

        onChangeLines(value) {
            this.log.log(-1, 'onChangeLines', 'enter', value)
            this.value.renderLines = value
            // this.hideMaybe()
            this.$emit('change', 'renderLines', value)
        },

        onChangeDistance(value) {
            this.log.log(-1, 'onChangeDistance', 'enter', value)
            this.value.showDistance = value
            // this.hideMaybe()
            this.$emit('change', 'showDistance', value)
        },

        onChangeRuler(value) {
            this.log.log(-1, 'onChangeRuler', 'enter', value)
            this.value.showRuler = value
            // this.hideMaybe()
            this.$emit('change', 'showRuler', value)
        },

        onChangeComments(value) {
            this.log.log(-1, 'onChangeRuler', 'enter', value)
            this.value.showComments = value
            // this.hideMaybe()
            this.$emit('change', 'showComments', value)
        },

        onChangeData(value) {
            this.log.log(-1, 'onChangeData', 'enter', value)
            this.value.hasDataView = value
            // this.hideMaybe()
            this.$emit('change', 'hasDataView', value)
        },

        onZoom(pos) {
            //this.hideMaybe()
            this.zoomLevelPos = pos
            this.value.zoom = this.zoomLevels[this.zoomLevelPos];
            this.$emit('change', 'zoom', this.value.zoom)
        },

        onZoomMinus() {
            this.log.log(-1, 'onZoomMinus', 'enter')
            //if (this.zoomLevelPos >= 1){
            this.zoomLevelPos--;
            let zoom = Math.round((this.value.zoom - 0.05) * 100)
            zoom -= zoom % 5
            zoom = Math.max(2, zoom)
            zoom /= 100
            this.value.zoom = zoom
            this.$emit('change', 'zoom', this.value.zoom)
            //}
            // this.hideMaybe()
            return false
        },

        onZoomPlus() {
            this.log.log(-1, 'onZoomPlus', 'enter')
            //if (this.zoomLevelPos < this.zoomLevels.length -1){
            this.zoomLevelPos++;
            let zoom = Math.round((this.value.zoom + 0.05) * 100)
            zoom -= zoom % 5
            zoom /= 100
            console.debug(zoom)
            this.value.zoom = zoom
            this.$emit('change', 'zoom', this.value.zoom)
            //}
            // this.hideMaybe()
            return false
        },


        showPopup() {
            if (this.hasPopup) {
                return
            }
            this.hasPopup = true
            /**
             * this will force all other popups to close
             */
            topic.publish("matc/canvas/click", "", "");
            /**
             * the canvas can register to this to flush stuff
             */
            topic.publish("matc/toolbar/click", "");

            this._mouseDownListener = on(win.body(), "mousedown", lang.hitch(this, "hidePopup"));
            this._topicListener = topic.subscribe("matc/canvas/click", lang.hitch(this, "onCanvasClick"));
            this._escListener = topic.subscribe("matc/canvas/esc", lang.hitch(this, "hidePopup"));
            this._dialogListner = topic.subscribe("vommond/dialog/open", lang.hitch(this, "hidePopup"));

            this.ignoreHide = false
        },

        onCanvasClick() {
            /**
             * A lot if the changes we trigger a rerender, which will as a result also
             * trigger a 'matc/canvas/click'. We want to be able to ignore this once!
             */
            if (this.ignoreHide) {
                this.ignoreHide = false
                return
            }
            this.hidePopup()
        },

        hideMaybe() {
            // this.ignoreHide = true
            this.hidePopup()
        },

        hidePopup() {
            this.hasPopup = false
            if (this._mouseDownListener) {
                this._mouseDownListener.remove();
                delete this._mouseDownListener;
            }
            if (this._topicListener) {
                this._topicListener.remove();
                delete this._topicListener;
            }
            if (this._escListener) {
                this._escListener.remove()
                delete this._escListener;
            }
            if (this._dialogListner) {
                this._dialogListner.remove();
                delete this._dialogListner;
            }
        }
    },
    watch: {
        value(v) {
            this.log.log(2, 'watch(value)', 'enter', v)
            this.value = v
        }
    },
    mounted() {
        this.log = new Logger('ViewConfig')
    }
}
</script>