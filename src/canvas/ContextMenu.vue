
<template>
    <div class="MatcContextMenu " v-show="isVisible" @click.stop="close">
        <div 
            class="MatcToolbarPopUp MatcToolbarPopUpOpen MatcToolbarDropDownButtonPopup" 
            :style="{'top': top + 'px', 'left': left + 'px'}" 
            role="menu" 
            ref="popup" 
            @mousedown.stop>
            <div class="MatcToolbarPopUpWrapper">
                <ul class="" role="menu">
                    <li v-for="i in options" :key="i.value" @click.stop="onSelect(i, $event)" :class="i.css"
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
            left:0,
            top:0,
            options: [
                { value: 'undo', icon: 'Undo', label: 'Undo', shortcut: 'STRG + Z' },
                { value: 'redo', icon: 'Redo', label: 'Redo', shortcut: 'STRG + SHIFT + Z' },
                {value: 1, css:'MatcToolbarPopUpLine'},
                { value: 'copy', icon: 'Copy', label: 'Copy', shortcut: 'STRG + C' },
                { value: 'paste', icon: 'Paste', label: 'Paste', shortcut: 'STRG + V' },
                { value: 'remove', icon: 'Delete', label: 'Delete', shortcut: 'DEL' },
                { value: 'copyStyle', icon: 'CopyStyle', label: 'Copy Style', shortcut: '' }
            ]
        }
    },
    components: {
        'QIcon': QIcon
    },
    methods: {
        close () {
            this.isVisible = false
        },
        show(e, hasSelection) {
            this.isVisible = true
            this.hasSelection = hasSelection
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
   
            topic.publish("matc/canvas/click", "", "", {isDropDown: true, isChildDropDown: this.isChildDropDown});
            topic.publish("matc/toolbar/click", "");
        },
        onSelect (item, e) {
            this.$emit('select', item, e)
            this.close()
        },
        getWinPosition(){
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