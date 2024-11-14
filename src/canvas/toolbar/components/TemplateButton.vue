
<template>
    <div class=" MatcToolbarArrowDropDown MatcToolbarDropDownButton" v-if="!hasTemplate" @click="onCreate">
        <div class="MatcToolbarItem MatcToolbarPrimaryItem" type="button">
            <label class="">
                <QIcon :icon="icon" />
            </label>
        </div>
    </div>
    <ArrowDropDown v-else @select="onSelect" :options="options" :icon="icon" css="MatcToolbarPrimaryItem"></ArrowDropDown>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import ArrowDropDown from './ArrowDropDown'
import QIcon from 'page/QIcon'
import _Tooltip from 'common/_Tooltip'

export default {
    name: 'TemplateButton',
    mixins: [Util, DojoWidget,_Tooltip],
    data: function () {
        return {
            icon: 'Component',
            widget: null,
            options: []
        }
    },
    components: {
        'ArrowDropDown': ArrowDropDown,
        'QIcon': QIcon
    },
    computed: {
        hasTemplate() {
            return this.widget && this.widget.template !== '' && this.widget.template !== undefined && this.widget.template !== null
        }
    },
    methods: {
        onCreate(e) {
            this.$emit('create', e)
        },
        onSelect(t, e) {
            if (t.value === 'remove') {
                this.$emit('remove', e)
            }
            if (t.value === 'update') {
                this.$emit('update', e)
            }
        },
        setWidget(widget) {
            this.widget = widget
            this.icon = 'Component'
            if (widget.template) {
                if (widget.isRootTemplate) {
                    this.icon = "ComponentRoot"
                    this.options = [
                        { value: "update", label: "Update all instances", icon: "ComponentUpdate" }, // show only when needed???
                        { value: "remove", label: "Unlink Component", icon: "ComponentUnlink" }
                    ]
                } else {
                    this.options = [
                        { value: "remove", label: "Unlink Component", icon: "ComponentUnlink" }
                    ]
                }
            }
        }
    },
    mounted() {
        this.addTooltip(this.$el, this.getNLS("tooltip.template"))
    }
}
</script>