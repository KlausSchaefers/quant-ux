
<template>
    <div :class="['MatcToolbarNavButton', {'MatcToolbarEditModeAnimated': animated}]">

        <div class="MatcToolbarEditModeCntr" ref="cntr">
           
            <a v-for="(m, i) in modes" @click="setSelected(m, i)" ref="btns" :key="m.value"
                :class="['MatcToolbarItem vommondToolTipCntr MatcToolbarItemIcon', { 'MatcToolbarEditModeActive': m.value === selected }]">
                <QIcon :icon="m.icon" v-if="hasIcons"/>
                <span class="MatcToolbarResponsiveLabel" v-else>
                    {{m.label}}
                </span>
            </a>
            <div class="MatcToolbarEditModeHighlight" :style="{ 'width': highlightWidth + 'px', 'left': highlightX + 'px' }">
            </div>
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
            hasIcons: true,
            animated:false,
            highlightWidth: 0,
            highlightX: 0,
            selected: 'Design',
            modes: [
                { label: 'Design', value: "Design", icon: "Design", tooltip: 'tooltip.toggle-design'},
               // { label: 'Prototype', value: "Prototype", icon: "Prototype" },
                { label: 'Heatmaps', value: "Heatmap", icon: "Heatmap", tooltip: 'tooltip.toggle-heatmap'},
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
            setTimeout(() => {
                this.$emit("change", m.value)
            }, 300)
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
        setTimeout(() => {
            this.modes.forEach((mode, i) => {
                this.addTooltip(this.$refs.btns[i], this.getNLS(mode.tooltip), 'vommondToolTipRightBottom')
                if (mode.value === this.value) {
                    this.setHighlight(i)
                    this.selected = mode.value
                }
            })
        }, 0)      
        setTimeout(() => {
            this.animated = true
        }, 500)
   
    }
};
</script>