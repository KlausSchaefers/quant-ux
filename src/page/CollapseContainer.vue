<template>
    <div :class="['MatcSplitView MatcCollapseView', {'MatcCollapseViewMin': this.collapsed}]">

        <div :class="['MatcSplitViewChild MatcSplitViewLeft MatcScrollContainer', {'MatcSplitViewChildBorder' : left} ] " :style="leftWidth" ref="leftChild">
            <slot name="left"></slot>
        </div>
        <div :class="['MatcSplitViewBorder']" >
            <div :class="['MatcCollapseViewHandler', {'MatcSplitViewHandlerLeft' : left} , {'MatcSplitViewHandlerRight' : right} ]" @click="onClick">
              <div class="MatcCollapseViewHandlerTop"></div>
              <div class="MatcCollapseViewHandlerBottom"></div>
            </div>
        </div>
        <div :class="['MatcSplitViewChild MatcSplitViewRight MatcScrollContainer', {'MatcSplitViewChildBorder' : right} ]" :style="rightWidth" ref="rightChild">
           <slot name="right"></slot>
        </div>    
    </div>
  </template>
  <style lang="scss">
    @import "../style/components/split_view.scss";
  </style>
  <script>
  export default {
    name: "CollapseContainer",
    mixins: [],
    props: ['left', 'right', 'min', 'qid'],
    data: function() {
      return {
        pos:0,
        collapsed: false
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
        onClick () {
            this.setCollapsed(!this.collapsed)
        },
        setCollapsed (v) {
            if (v) {
                this.collapsed = true
                this.pos = this.min
            } else {
                this.pos = this.max
                this.collapsed = false
            }
            localStorage.setItem('quxCollapseContainer'+this.qid, this.collapsed)
        }
    },
    async mounted() {
      if (this.left) {
        this.pos = this.left
        this.max = this.left
      } 
      if (this.right) {
        this.pos = this.right
        this.max = this.right
      }
      let old = localStorage.getItem('quxCollapseContainer'+this.qid)
      if (old === 'true') {
        this.setCollapsed(true)
      }
    }
  };
  </script>
  
  