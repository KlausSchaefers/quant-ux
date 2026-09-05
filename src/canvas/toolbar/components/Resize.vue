<template>
    <div class="MatcToolbarResize">
        <template v-if="isContainerChild">
            <div class="MatcToolbarResizeFlexOrGrid">                
                <ToolbarDropDownButton :qOptions="options" :qReposition="true" :qValue="flexAlign" @change="toggleFlex" :qMaxLabelLength="20"/>
            </div>
        </template>
        <div class="MatcToolbarResizeAbsolute" v-else>


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
            isContainerChild: false,

            parentWidget: null,
        }
    },
    components: {ToolbarDropDownButton},
    computed: {
        options () {
            if (this.parentWidget?.style?.flexDirection === 'row') {
                return [
                    { value:'fixed', icon:"LockClosed", label:"Fixed Width"},
                    { value: 'grow', icon:"FlexGrowWidth", label: "Flexible With"}
                ]
            }
            return [
                { value:'fixed', icon:"LockClosed", label:"Fixed Height"},
                { value: 'grow', icon:"FlexGrowHeight", label: "Flexible Height"}
            ]

        },
        flexAlign () {

            if (this.growHorizontal || this.growVertical) {
                return 'fixed'
            }
            return 'grow'
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
        toggleFlex (align) {
            const v = align === 'fixed'
            this.growVertical = v
            this.growHorizontal = v
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
                fixedVertical: this.growVertical
            }
            this.isDirty = true
            this.emit('change', resize)
        },

        setValue(v) {
            if (this.lastWidgetID != v.id) {
                this.isDirty = false;
            }
            if (v.props && v.props.resize) {
                let resize = v.props.resize
                this.hasPinRight = resize.right
                this.hasPinUp = resize.up
                this.hasPinLeft = resize.left
                this.hasPinDown = resize.down
                this.growHorizontal = resize.fixedHorizontal
                this.growVertical = resize.fixedVertical
            } else {
                this.hasPinRight = false
                this.hasPinUp = false
                this.hasPinLeft = false
                this.hasPinDown = false
                this.growHorizontal = false
                this.growVertical = false
            }
            this.lastWidgetID = v.id;
        },

        setModel(m) {
            this.model = m;
        },

        setParentLayoutContainer(v) {
            console.debug(v)
            this.isContainerChild = v !== undefined && v !== null && v.type === 'FlexContainer'
            this.parentWidget = v
        }
    },
    mounted() {
    }
}
</script>