
<template>
    <div class="MatcToolbarNavButton">

        <div class="MatcToolbarEditModeCntr" ref="cntr">
            <div class="MatcToolbarEditModeHighlight" :style="{ 'width': highlightWidth + 'px', 'left': highlightX + 'px' }">
            </div>
            <a v-for="(m, i) in modes" @click="setSelected(m, i)" ref="btns" :key="m.value"
                :class="['MatcToolbarItem MatcToolbarItemIcon', { 'MatcToolbarEditModeActive': m.value === selected }]">
                <QIcon :icon="m.icon"/>
                <!-- <span class="MatcToolbarResponsiveLabel">
                    {{m.label}}
                </span> -->
            </a>
        </div>

    </div>
</template>
<style lang="scss">
    @import '../../../style/toolbar/toolbar_nav_button.scss';
</style>
<script>

import Logger from "common/Logger";
import _Tooltip from 'common/_Tooltip'
import NLS from 'common/NLS'
import domGeom from 'dojo/domGeom'
import QIcon from 'page/QIcon'

export default {
    name: "EditModeButton",
    mixins: [_Tooltip, NLS],
    props: ['value'],
    data: function () {
        return {
            highlightWidth: 0,
            highlightX: 0,
            selected: 'Design',
            modes: [
                { label: 'Design', value: "Design", icon: "Design" },
                { label: 'Heatmaps', value: "Heatmap", icon: "Heatmap" },
              ]
        };
    },
    computed: {
    },
    components: {
        'QIcon': QIcon
    },
    methods: {
        setSelected(m, i) {
            this.log.log(1, 'setSelected', 'enter', m)
            this.selected = m.value
            this.setHighlight(i)
            //setTimeout(() => {
                this.$emit("change", m.value)
           // }, 200)
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
        this.log = new Logger("HeatmapToggleButton")
        this.setHighlight(0)
        setTimeout(() => {
            this.modes.forEach((mode, i) => {
                if (mode.value === this.value) {
                    this.setHighlight(i)
                    this.selected = mode.value
                }
            })
        }, 30)

 
    }
};
</script>