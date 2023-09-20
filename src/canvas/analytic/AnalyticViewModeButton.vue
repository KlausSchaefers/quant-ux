
<template>
    <div class="MatcToolbarNavButton">

        <div class="MatcToolbarEditModeCntr" ref="cntr">
            <div class="MatcToolbarEditModeHighlight" :style="{ 'width': highlightWidth + 'px', 'left': highlightX + 'px' }">
            </div>
            <a v-for="(m, i) in modes" @click="setSelected(m, i)" ref="btns" :key="m.value"
                :class="['MatcToolbarItem', { 'MatcToolbarEditModeActive': m.value === selected }]">
                <span :class="'MatcToolbarResponsiveIcon ' + m.icon" ref="icons"/>
                <span class="MatcToolbarResponsiveLabel">
                    {{m.label}}
                </span>
            </a>
        </div>

    </div>
</template>
<style lang="scss">
    @import '../../style/toolbar/toolbar_nav_button.scss';
</style>
<script>

import Logger from "common/Logger";
import _Tooltip from 'common/_Tooltip'
import NLS from 'common/NLS'
import domGeom from 'dojo/domGeom'

export default {
    name: "EditModeButton",
    mixins: [_Tooltip, NLS],
    props: ['value'],
    data: function () {
        return {
            highlightWidth: 0,
            highlightX: 0,
            selected: 'showClickHeatMap',
            modes: [
                { label: 'Heatmaps', value: "showClickHeatMap", icon: "mdi mdi-cursor-default" },
                // { label: 'Mouse Heatmap', value: "showMouseHeatMap", icon: "mdi mdi-mouse" },
                { label: 'User Journey', value: "showUserJourney", icon: "mdi mdi-vector-polyline" },
                { label: 'Tasks & Drop Off', value: "showDropOff", icon: "mdi mdi-chart-timeline-variant-shimmer" },
                //{ label: 'Views', value: "showViewMap", icon: "mdi mdi-eye" },
                { label: 'Dwell Time', value: "showDwelTimeMap", icon: "mdi mdi-timelapse" },
                { label: 'Scroll', value: "showScrollHeatMap", icon: "mdi mdi-swap-vertical" },
                { label: 'Scroll Time', value: "showScrollTimeMa", icon: "mdi mdi-timer" },
            ]
        };
    },
    computed: {
        hasData() {
            if (this.value) {
                return this.value.hasDataView
            }
            return true
        }
    },
    components: {},
    methods: {
        setSelected(m, i) {
            this.log.log(1, 'setSelected', 'enter', m)
            this.selected = m.value
            this.setHighlight(i)
            this.$emit("change", m.value)
        },
    
        setHighlight(i) {
            const node = this.$refs.btns[i]
            const pos = domGeom.position(node)
            const cPos = domGeom.position(this.$refs.cntr)
            this.highlightWidth = pos.w
            this.highlightX = pos.x - cPos.x - 1
        },
        nextView() {
        }
    },
    watch: {
        value(v) {
            this.log.log(2, 'watch(value)', 'enter', v)
            this.value = v
        }
    },
    async mounted() {
        this.log = new Logger("AnalyticViewModeButton")
        this.setHighlight(0)
        setTimeout(() => {
            this.modes.forEach((mode, i) => {
                const icon = this.$refs.icons[i]
                this.addTooltip(icon, mode.label)
            })
        }, 100)

 
    }
};
</script>