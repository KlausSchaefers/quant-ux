
<template>
    <div class="MatcContextMenu " v-show="isVisible" @click.stop="close">
        <div class="MatcToolbarPopUp MatcToolbarPopUpOpen MatcToolbarDropDownButtonPopup"
            :style="{ 'top': top + 'px', 'left': left + 'px' }" role="menu" ref="popup" @mousedown.stop>
            <div class="MatcToolbarPopUpWrapper">
                <ul class="" role="menu">
                    <li v-for="i in selectedOptions" :key="i.value" @click.stop="onSelect(i, $event)" :class="i.css"
                        class="MatcToolbarMenuItem">
                        <QIcon class="MatcToolbarPopUpIcon" :icon="i.icon" v-if="i.icon" />
                        <label class="MatcToolbarPopUpLabel">{{ i.label }}</label>
                        <label class="MatcToolbarPopUpLabelShortCut" v-if="i.shortcut" v-html="i.shortcut"></label>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
import QIcon from 'page/QIcon'
import domGeom from 'dojo/domGeom'
import topic from 'dojo/topic'

export default {
    name: 'ContextMenu',
    mixins: [],
    props: [],
    data: function () {
        return {
            isVisible: false,
            hasSelectedGroup: false,
            hasMultiSelection: false,
            left: 0,
            top: 0,
            options: [
                { value: 'undo', icon: 'Undo', label: 'Undo', shortcut: 'CTRL + Z' },
                { value: 'redo', icon: 'Redo', label: 'Redo', shortcut: 'CTRL + SHIFT + Z' },
                { value: 1, css: 'MatcToolbarPopUpLine' },
                { value: 'copy', icon: 'Copy', label: 'Copy', shortcut: 'CTRL + C' },
                { value: 'paste', icon: 'Paste', label: 'Paste', shortcut: 'CTRL + V' },
                { value: 'remove', icon: 'Delete', label: 'Delete', shortcut: 'DEL' },
                { value: 'copyStyle', icon: 'CopyStyle', label: 'Copy Style', shortcut: '' }
            ],
            groupOptions: [
                { value: 2, css: 'MatcToolbarPopUpLine' },
                { value: 'group', icon: 'Group', label: 'Group', shortcut: 'CTRL + G' },
            ],
            unGroupOptions: [
                { value: 2, css: 'MatcToolbarPopUpLine' },
                { value: 'ungroup', icon: 'UnGroup', label: 'UnGroup', shortcut: 'CTRL + G' },
            ]
        }
    },
    computed: {
        selectedOptions () {
            let result = this.options
            if (this.hasMultiSelection) {
                result = result.concat(this.groupOptions)
            } else {
                if (this.hasSelectedGroup) {
                    result = result.concat(this.unGroupOptions)
                }
            }
            return result
        },
    },
    components: {
        'QIcon': QIcon
    },
    methods: {
        close() {
            this.isVisible = false
        },
        show(e, hasSelection, selectMulti=false, selectedGroup=false) {
            this.isVisible = true
            this.hasSelection = hasSelection
            this.hasSelectedGroup = selectedGroup
            this.hasMultiSelection = selectMulti
            this.$nextTick(() => {
                const pos = this.getMousePosition(e)
                const popupSize = domGeom.position(this.$refs.popup)
                const winSize = this.getWinPosition()

                if (pos.x < winSize.w / 2) {
                    this.left = pos.x
                } else {
                    this.left = pos.x - popupSize.w
                }

                if (pos.y < winSize.h / 2) {
                    this.top = pos.y
                } else {
                    this.top = pos.y - popupSize.h
                }
            })

            topic.publish("matc/canvas/click", "", "", { isDropDown: true, isChildDropDown: this.isChildDropDown });
            topic.publish("matc/toolbar/click", "");
        },
        onSelect(item, e) {
            this.$emit('select', item, e)
            this.close()
        },
        getWinPosition() {
            return {
                w: window.innerWidth,
                h: window.innerHeight
            }
        },
        getMousePosition(e) {
            // updated and synced with simulator
            // in case of error roll back and change mixin order in simulator
            let result = { x: 0, y: 0 };
            if (e) {
                if (e.touches && e.touches.length > 0) {
                    e = e.touches[0]
                    result.x = e.clientX;
                    result.y = e.clientY;
                } else if (e.changedTouches && e.changedTouches.length > 0) {
                    e = e.changedTouches[0]
                    result.x = e.clientX;
                    result.y = e.clientY;
                } else {
                    result.x = e.pageX;
                    result.y = e.pageY;
                }
            }
            return result;
        },
    },
    mounted() {
    }
}
</script>