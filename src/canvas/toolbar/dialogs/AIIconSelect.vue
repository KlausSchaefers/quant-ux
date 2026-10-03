<template>
    <div :class="['MatcAiSelect', {'MatcAiSelectOpen': isOpen}]" @keydown="onKeyDown">
        <button type="button" class="MatcAiSelectButton" ref="button" @click="toggle">
            <span class="MatcAiSelectIcon" v-if="selected && selected.icon" v-html="selected.icon"></span>
            <span class="MatcAiSelectText" v-if="selected">
                <span class="MatcAiSelectLabel">{{ selected.label }}</span>
                <span class="MatcAiSelectHint" v-if="selected.description">{{ selected.description }}</span>
            </span>
            <span class="MatcAiSelectText MatcAiSelectPlaceholder" v-else>{{ placeholder }}</span>
            <span class="MatcAiSelectCaret"></span>
        </button>
        <ul :class="['MatcAiSelectPopup', {'MatcAiSelectPopupUp': openUp}]" role="listbox" v-if="isOpen" ref="popup" :style="popupStyle">
            <li v-for="(o, i) in options" :key="o.value"
                role="option"
                :aria-selected="o.value === value"
                :class="['MatcAiSelectOption', {
                    'MatcAiSelectOptionSelected': o.value === value,
                    'MatcAiSelectOptionActive': i === activeIndex
                }]"
                @mousedown.prevent=""
                @mouseenter="activeIndex = i"
                @click="select(o)">
                <span class="MatcAiSelectIcon" v-if="o.icon" v-html="o.icon"></span>
                <span class="MatcAiSelectText">
                    <span class="MatcAiSelectLabel">{{ o.label }}</span>
                    <span class="MatcAiSelectHint" v-if="o.description">{{ o.description }}</span>
                </span>
                <span class="MatcAiSelectBadge" v-if="o.badge">{{ o.badge }}</span>
                <span class="MatcAiSelectCheck" v-if="o.value === value"></span>
            </li>
        </ul>
    </div>
</template>

<script>
/**
 * A dropdown whose options have an icon (inline SVG), a label, an optional
 * description and badge. Used for the provider and model choice in the AI
 * settings. Keyboard: arrows move, Enter selects, Escape closes.
 *
 * The popup is position: fixed, because the dialog wrapper clips its
 * content (overflow: hidden). It opens above the button when there is more
 * room there, and is never taller than the space it has in the viewport.
 */

const POPUP_GAP = 4
const POPUP_MAX_HEIGHT = 320
const VIEWPORT_MARGIN = 8
export default {
    name: 'AIIconSelect',
    props: {
        options: { type: Array, default: () => [] },
        value: { type: String, default: '' },
        placeholder: { type: String, default: 'Select...' }
    },
    data: function () {
        return {
            isOpen: false,
            openUp: false,
            popupStyle: {},
            activeIndex: -1
        }
    },
    computed: {
        selected () {
            return this.options.find(o => o.value === this.value)
        }
    },
    methods: {
        toggle () {
            if (this.isOpen) {
                this.close()
            } else {
                this.open()
            }
        },
        open () {
            this.isOpen = true
            this.activeIndex = Math.max(0, this.options.findIndex(o => o.value === this.value))
            this.placePopup()
            document.addEventListener('mousedown', this.onOutside, true)
            window.addEventListener('resize', this.close)
            window.addEventListener('scroll', this.onScroll, true)
            this.$nextTick(() => this.scrollToActive())
        },
        close () {
            this.isOpen = false
            document.removeEventListener('mousedown', this.onOutside, true)
            window.removeEventListener('resize', this.close)
            window.removeEventListener('scroll', this.onScroll, true)
        },
        placePopup () {
            const rect = this.$refs.button.getBoundingClientRect()
            const below = window.innerHeight - rect.bottom - POPUP_GAP - VIEWPORT_MARGIN
            const above = rect.top - POPUP_GAP - VIEWPORT_MARGIN
            this.openUp = below < POPUP_MAX_HEIGHT && above > below
            const style = {
                left: rect.left + 'px',
                width: rect.width + 'px',
                maxHeight: Math.min(POPUP_MAX_HEIGHT, this.openUp ? above : below) + 'px'
            }
            if (this.openUp) {
                style.bottom = (window.innerHeight - rect.top + POPUP_GAP) + 'px'
            } else {
                style.top = (rect.bottom + POPUP_GAP) + 'px'
            }
            this.popupStyle = style
        },
        onScroll (e) {
            // the fixed popup would not follow the page, so close it. Scrolling
            // the list itself is fine.
            if (!this.$refs.popup || !this.$refs.popup.contains(e.target)) {
                this.close()
            }
        },
        scrollToActive () {
            const popup = this.$refs.popup
            const li = popup && popup.children[this.activeIndex]
            if (li) {
                const top = li.offsetTop
                const bottom = top + li.offsetHeight
                if (top < popup.scrollTop) {
                    popup.scrollTop = top
                } else if (bottom > popup.scrollTop + popup.clientHeight) {
                    popup.scrollTop = bottom - popup.clientHeight
                }
            }
        },
        onOutside (e) {
            if (!this.$el.contains(e.target)) {
                this.close()
            }
        },
        select (o) {
            this.close()
            this.$refs.button.focus()
            if (o.value !== this.value) {
                this.$emit('change', o.value)
            }
        },
        onKeyDown (e) {
            const key = e.key
            if (!this.isOpen) {
                if (key === 'ArrowDown' || key === 'ArrowUp') {
                    e.preventDefault()
                    this.open()
                }
                return
            }
            if (key === 'Escape') {
                e.preventDefault()
                e.stopPropagation()
                this.close()
            } else if (key === 'ArrowDown') {
                e.preventDefault()
                this.activeIndex = (this.activeIndex + 1) % this.options.length
                this.$nextTick(() => this.scrollToActive())
            } else if (key === 'ArrowUp') {
                e.preventDefault()
                this.activeIndex = (this.activeIndex - 1 + this.options.length) % this.options.length
                this.$nextTick(() => this.scrollToActive())
            } else if (key === 'Enter' || key === ' ') {
                e.preventDefault()
                const o = this.options[this.activeIndex]
                if (o) {
                    this.select(o)
                }
            } else if (key === 'Tab') {
                this.close()
            }
        }
    },
    beforeDestroy () {
        this.close()
    }
}
</script>
