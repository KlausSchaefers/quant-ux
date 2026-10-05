<template>
    <div class="MatcToolbarResize">
        <div class="MatcToolbarResizeFlexOrGrid" v-if="showSizing">
            <template v-if="!isGroup">
                <ToolbarDropDownButton :qOptions="widthOptions" :qReposition="true" :qValue="sizingWidth" @change="setSizingWidth" :qMaxLabelLength="20"/>
                <ToolbarDropDownButton :qOptions="heightOptions" :qReposition="true" :qValue="sizingHeight" @change="setSizingHeight" :qMaxLabelLength="20"/>
                <div class="MatcToolbarResizeLimits" v-if="showLimits">
                    <InputDropDownButton v-for="limit in limitKeys" :key="limit.key"
                        :qOptions="limitOptions" :qReposition="true" :qValue="String(limits[limit.key] || 0)"
                        :qPostfix="' (' + limit.label + ')'" @change="setLimit(limit.key, $event)"/>
                </div>
            </template>
            <CheckBox v-if="isContainerChild" :value="absolute" label="Ignore auto layout" @change="setAbsolute" class="MatcToolbarItem"/>
        </div>
        <div class="MatcToolbarResizeAbsolute" v-if="!isContainerChild">


            <div class="MatcToolbarResizePinCntr">
                <div class="MatcToolbarResizePin MatcToolbarResizeElement">

                    <div @click="toggleUp" :class="['MatcToolbarResizePinUp', { 'MatcToolbarResizeActive': hasPinUp }]">
                        <div class="MatcToolbarResizePinLine" />
                    </div>
                    <div @click="toggleLeft"
                        :class="['MatcToolbarResizePinLeft', { 'MatcToolbarResizeActive': hasPinLeft }]">
                        <div class="MatcToolbarResizePinLine" />
                    </div>
                    <div @click="toggleRight"
                        :class="['MatcToolbarResizePinRight', { 'MatcToolbarResizeActive': hasPinRight }]">
                        <div class="MatcToolbarResizePinLine" />
                    </div>
                    <div @click="toggleDown"
                        :class="['MatcToolbarResizePinDown', { 'MatcToolbarResizeActive': hasPinDown }]">
                        <div class="MatcToolbarResizePinLine" />
                    </div>
                    <div @click="toggleAll" :class="['MatcToolbarResizePinCenter']">
                        <div class="MatcToolbarResizePinLine" />
                    </div>

                </div>
                <span class="MatcToolbarResizeLabel">Pin</span>
            </div>

            <div class="MatcToolbarResizePinCntr">
                <div class="MatcToolbarResizePin MatcToolbarResizeElement">

                    <div @click="toggleHorizontal"
                        :class="['MatcToolbarResizeGrowHorizontal', { 'MatcToolbarResizeActive': growHorizontal }]">
                        <div class="MatcToolbarResizeGrowLine" />
                    </div>
                    <div @click="toggleVertical"
                        :class="['MatcToolbarResizeGrowVertical', { 'MatcToolbarResizeActive': growVertical }]">
                        <div class="MatcToolbarResizeGrowLine" />
                    </div>


                </div>
                <span class="MatcToolbarResizeLabel">Fixed Size</span>
            </div>


            <div class="MatcToolbarResizePreviewCntr">
                <div class="MatcToolbarResizePreview">
                    <div :class="['MatcToolbarResizePreviewBox', { 'MatcToolbarResizePreviewBoxAnimated': isDirty }]"
                        :style="previewStyle" />
                </div>
                <span class="MatcToolbarResizeLabel">Preview</span>
            </div>
        </div>

    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import ToolbarDropDownButton from './ToolbarDropDownButton'
import InputDropDownButton from './InputDropDownButton'
import CheckBox from 'common/CheckBox'
import * as FlexMath from 'core/responsive/FlexMath'
import { TEXT_TYPES } from 'core/responsive/FlexLayout'

export default {
    name: 'Responsove',
    mixins: [DojoWidget],
    data: function () {
        return {
            hasPinUp: false,
            hasPinLeft: false,
            hasPinRight: false,
            hasPinDown: false,
            isDirty: false,
            growHorizontal: false,
            growVertical: false,
            grow:0,
            isContainerChild: false,
            parentWidget: null,
            widget: null,
            layoutWidth: null,
            layoutHeight: null,
            absolute: false,
            // min and max sizes, 0 is none
            limits: {},
            limitKeys: [
                { key: 'minWidth', label: 'Min Width' },
                { key: 'maxWidth', label: 'Max Width' },
                { key: 'minHeight', label: 'Min Height' },
                { key: 'maxHeight', label: 'Max Height' }
            ],
            limitOptions: [0, 40, 80, 120, 200, 320, 480, 640]
        }
    },
    components: {ToolbarDropDownButton, InputDropDownButton, CheckBox},
    computed: {
        /**
         * Like in Figma, a widget has a sizing per axis: fixed, hug its
         * content (a text, a FlexContainer) or fill the free space of the
         * FlexContainer it is in.
         */
        canHug () {
            const w = this.widget
            if (!w) {
                return false
            }
            return w.type === 'FlexContainer' || (TEXT_TYPES.has(w.type) && !!(w.props && w.props.label))
        },
        // a group is as big as its members, it has no sizing
        isGroup () {
            return !!this.widget && !this.widget.type
        },
        /**
         * Min and max sizes matter where the size is not fixed: a fill or
         * hug size.
         */
        showLimits () {
            return this.sizingWidth !== 'fixed' || this.sizingHeight !== 'fixed'
        },
        showSizing () {
            return this.isContainerChild || this.canHug
        },
        parentConfig () {
            return this.isContainerChild ? FlexMath.getContainerConfig(this.parentWidget.style) : null
        },
        widthOptions () {
            return this.getSizingOptions('Width', 'FlexGrowWidth')
        },
        heightOptions () {
            return this.getSizingOptions('Height', 'FlexGrowHeight')
        },
        sizingWidth () {
            return FlexMath.getSizing(this.getSizingModel(), 'h', this.parentConfig, this.canHug)
        },
        sizingHeight () {
            return FlexMath.getSizing(this.getSizingModel(), 'v', this.parentConfig, this.canHug)
        },

        previewStyle() {
            let height = '20px'
            let width = '20px';
            let top = 'calc(50% - 10px)'
            let left = 'calc(50% - 10px)'

            if (this.hasPinUp && this.hasPinDown) {
                height = '80%';
                top = "5px";
            } else if (this.hasPinUp && !this.hasPinDown) {
                top = "5px";
            } else if (!this.hasPinUp && this.hasPinDown) {
                top = "calc(100% - 25px)";
            }

            if (this.hasPinLeft && this.hasPinRight) {
                width = 'calc(100% - 10px)';
                left = "5px";
            } else if (this.hasPinLeft && !this.hasPinRight) {
                left = "5px";
            } else if (!this.hasPinLeft && this.hasPinRight) {
                left = "calc(100% - 25px)";
            }
            let res = `height: ${height}; width: ${width}; top: ${top}; left: ${left};`
            return res
        }
    },
    methods: {
        getSizingOptions (axis, fillIcon) {
            const options = [{ value: 'fixed', icon: 'LockClosed', label: 'Fixed ' + axis }]
            if (this.canHug) {
                options.push({ value: 'hug', icon: 'Minimize', label: 'Hug ' + axis })
            }
            if (this.isContainerChild) {
                options.push({ value: 'fill', icon: fillIcon, label: 'Fill ' + axis })
            }
            return options
        },
        /**
         * The widget with the sizing as it is set right now in this
         * component, for FlexMath.getSizing(), which also resolves the
         * sizing of a widget from before the sizings existed.
         */
        getSizingModel () {
            return {
                props: {
                    resize: {
                        layoutWidth: this.layoutWidth,
                        layoutHeight: this.layoutHeight,
                        grow: this.grow,
                        fixedHorizontal: this.growHorizontal,
                        fixedVertical: this.growVertical
                    }
                }
            }
        },
        setSizingWidth (value) {
            this.layoutWidth = value
            this.onChange()
        },
        setSizingHeight (value) {
            this.layoutHeight = value
            this.onChange()
        },
        setLimit (key, value) {
            const n = parseInt(value, 10)
            this.limits = Object.assign({}, this.limits, { [key]: Number.isFinite(n) && n > 0 ? n : 0 })
            this.onChange()
        },
        setAbsolute (value) {
            this.absolute = value
            this.onChange()
        },
        toggleVertical() {
            this.growVertical = !this.growVertical
            this.onChange()
        },
        toggleHorizontal() {
            this.growHorizontal = !this.growHorizontal
            this.onChange()
        },
        toggleUp() {
            this.hasPinUp = !this.hasPinUp
            this.onChange()
        },
        toggleDown() {
            this.hasPinDown = !this.hasPinDown
            this.onChange()
        },
        toggleLeft() {
            this.hasPinLeft = !this.hasPinLeft
            this.onChange()
        },
        toggleRight() {
            this.hasPinRight = !this.hasPinRight
            this.onChange()
        },
        toggleAll() {
            let hasOnePin = this.hasPinRight && this.hasPinUp && this.hasPinLeft && this.hasPinDown
            this.hasPinRight = !hasOnePin
            this.hasPinUp = !hasOnePin
            this.hasPinLeft = !hasOnePin
            this.hasPinDown = !hasOnePin
            this.onChange()
        },

        blur() {
        },

        onChange() {
            if (this.hasPinRight && this.hasPinLeft) {
                this.growHorizontal = false;
            }
            if (this.hasPinUp && this.hasPinDown) {
                this.growVertical = false;
            }
            let resize = {
                right: this.hasPinRight,
                up: this.hasPinUp,
                left: this.hasPinLeft,
                down: this.hasPinDown,
                fixedHorizontal: this.growHorizontal,
                fixedVertical: this.growVertical,
                grow: this.getGrow(),
                absolute: this.absolute
            }
            if (this.layoutWidth) {
                resize.layoutWidth = this.layoutWidth
            }
            if (this.layoutHeight) {
                resize.layoutHeight = this.layoutHeight
            }
            this.limitKeys.forEach(limit => {
                if (this.limits[limit.key] > 0) {
                    resize[limit.key] = this.limits[limit.key]
                }
            })
            this.isDirty = true
            this.emit('change', resize)
        },

        /**
         * The first version had only grow on the main axis. It stays in sync
         * with the fill sizing, for what still reads it.
         */
        getGrow () {
            if (!this.parentConfig) {
                return this.grow
            }
            const main = this.parentConfig.isColumn ? this.layoutHeight : this.layoutWidth
            if (!main) {
                return this.grow
            }
            return main === 'fill' ? 1 : 0
        },

        setValue(v) {
            if (this.lastWidgetID != v.id) {
                this.isDirty = false;
            }
            this.widget = v
            if (v.props && v.props.resize) {
                let resize = v.props.resize
                this.hasPinRight = resize.right
                this.hasPinUp = resize.up
                this.hasPinLeft = resize.left
                this.hasPinDown = resize.down
                this.growHorizontal = resize.fixedHorizontal
                this.growVertical = resize.fixedVertical
                this.grow = resize.grow
                this.layoutWidth = resize.layoutWidth || null
                this.layoutHeight = resize.layoutHeight || null
                this.absolute = !!resize.absolute
                this.limits = {
                    minWidth: resize.minWidth || 0,
                    maxWidth: resize.maxWidth || 0,
                    minHeight: resize.minHeight || 0,
                    maxHeight: resize.maxHeight || 0
                }
            } else {
                this.hasPinRight = false
                this.hasPinUp = false
                this.hasPinLeft = false
                this.hasPinDown = false
                this.growHorizontal = false
                this.growVertical = false
                this.grow = 0
                this.layoutWidth = null
                this.layoutHeight = null
                this.absolute = false
                this.limits = {}
            }
            this.lastWidgetID = v.id;
        },

        setModel(m) {
            this.model = m;
        },

        setParentLayoutContainer(v) {            
            this.isContainerChild = v !== undefined && v !== null && v.type === 'FlexContainer'
            this.parentWidget = v
        }
    },
    mounted() {
    }
}
</script>