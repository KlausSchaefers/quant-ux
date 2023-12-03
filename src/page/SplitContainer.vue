<template>
    <div class="MatcSplitView">

        <div :class="['MatcSplitViewChild MatcSplitViewLeft ', {'MatcSplitViewChildBorder' : left} ] " :style="leftWidth" ref="leftChild">
            <slot name="left"></slot>
        </div>
        <div :class="['MatcSplitViewBorder']" >
            <div :class="['MatcSplitViewHandler', {'MatcSplitViewHandlerLeft' : left} , {'MatcSplitViewHandlerRight' : right} ]" @mousedown="onMousedown"></div>
        </div>
        <div :class="['MatcSplitViewChild MatcSplitViewRight ', {'MatcSplitViewChildBorder' : right} ]" :style="rightWidth" ref="rightChild">
      
            <slot name="right"></slot>
        </div>    
    </div>
  </template>
  <style lang="scss">
    @import "../style/components/split_view.scss";
  </style>
  <script>
  import {onStartDND} from '../util/DND'
  import * as ScrollUtil from '../util/ScrollUtil'
  export default {
    name: "SplitView",
    mixins: [],
    props: ['left', 'right'],
    data: function() {
      return {
        pos:0,
      };
    },
    watch: {},
    computed: {
        leftWidth () {
            if (this.left) {
                return 'width:' + this.pos +'px'
            }
            return `width: calc(100% - ${this.pos}px)`
        },
        rightWidth () {
            if (this.right) {
                return 'width:' + this.pos +'px'
            }
            return `width: calc(100% - ${this.pos}px)`
        }
    },
    components: {
    },
    methods: {
        onMousedown (e) {
            const pos = this.pos
            onStartDND(e, d => {
                if (this.left) {
                    this.pos = pos + d.x
                } else {
                    this.pos = pos - d.x
                }
            })
        }
        
    },
    async mounted() {
      if (this.left) {
        this.pos = this.left
      } 
      if (this.right) {
        this.pos = this.right
      }
      ScrollUtil.addScrollIfNeeded(this.$refs.leftChild, false)
      ScrollUtil.addScrollIfNeeded(this.$refs.rightChild, false)
    }
  };
  </script>
  
  