<template>
    <div 
        v-if="visible" 
        :class="['ZoomDialogBackground', 
                {'ZoomDialogHidden': step == 0}, 
                {'ZoomDialogAnimation': step >= 2}]" 
        @mousedown="close">
        <div class="ZoomDialogContainer" ref="container" @click.stop="" @mousedown.stop="">
            <div :class="['ZoomDialogWrapper', {'ZoomDialogWrapperOverflow': overflow === 'visible'}]" ref="wrapper">
                <div class="ZoomDialogContent" ref="content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    @import "../style/components/zoom_dialog.scss";
</style>
<script>
export default {
    name: "ZoomDialog",
    props: ['overflow'],
    data: function () {
      return {
        visible: false,
        step:0
      };
    },
    methods: {
        show (target) {
            const startPos = this.position(target)
            this.visible = true
            this.step = 0
            setTimeout(() => {
                this.animStep1(startPos)
            }, 100);
        },
        animStep1(startPos) {
 
            const container = this.$refs.container
            const content = this.$refs.content
      
            const endPos = this.position(content)
            const w = startPos.w / endPos.w
            const h = startPos.h / endPos.h
            const x = Math.round(startPos.x - endPos.x)
            const y = Math.round(startPos.y - endPos.y)
            container.style.transform = `translate(${x}px, ${y}px) scale(${w}, ${h})` //scale(${w}, ${h});
            container.style.opacity = 0.3
            this.step = 1
            setTimeout(() => {
                this.animStep2()
            }, 100);
        },
        animStep2 () {
            this.step = 2
            const container = this.$refs.container
            container.style.transform = `scale(1,1)`
            container.style.opacity = 1
        },
        close () {
            this.visible = false
            this.step = 0
        },
        position (node, includeScroll = false) {
            if (node) {
                if (node && node.toLowerCase) {
                    node = document.getElementById(node)
                }
                const clientRect = node.getBoundingClientRect();
                const ret = {
                    x: clientRect.left, 
                    y: clientRect.top, 
                    w: clientRect.right - clientRect.left, 
                    h: clientRect.bottom - clientRect.top
                };
                if(includeScroll){
                    ret.x += window.scrollX
                    ret.y += window.scrollY
                }
                return ret;
            }
            return {
                x: 0, y:0, w: 100, h:100
            }	
        },
        shake () {
            const wrapper = this.$refs.wrapper;         
            setTimeout(() => {
                wrapper.style.left = (50) + "px";
            }, 1);

            setTimeout(() => {
                wrapper.style.left = (-50) + "px";
            }, 51);

            setTimeout(() => {
                wrapper.style.left = (50) + "px";
            }, 101);

            setTimeout(() => {
                wrapper.style.left = (-50) + "px";
            }, 151);

            setTimeout(() => {
                wrapper.style.left = (0) + "px";
            }, 201);

        }
    }
}
</script>