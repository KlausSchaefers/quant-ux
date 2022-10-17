<script>
export default {
  name: "KeyBoardDispatcher",
  data: function() {
    return {
    };
  },
  computed: {
  },
  components: {
  },
  methods: {
    onKeyUp (e) {
        //const isMeta = e.altKey || e.ctrlKey || e.metaKey;
      
        //const isShift = e.shiftKey


        if (e.key === 'Escape') {
            this.onEsc()
            return true
        }
        if (e.key === 'Enter') {
            this.onEnter()
            return true
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            this.onDelete()
            return true
        }
      
        //const isCntrl = e.ctrlKey || e.metaKey;
        // if (isCntrl) {
        //     this.stopEvent(e)
        //     if (e.key === 'ArrowUp') {
        //         this.moveSelectedPathToTop(true)
        //         return
        //     }
        //     if (e.key === 'ArrowDown') {
        //         this.moveSelectedPathToBottom(true)
        //         return
        //     }
        //     if (e.key === 'c') {
        //         this.copySelection()
        //         return
        //     }

        //     if (e.key === 'v') {
        //         this.pasteSelection()
        //         return
        //     }
        // }

        // if (e.key === 'v') {
        //     this.startBezierTool()
        //     return
        // }
        // if (e.key === 'l') {
        //     this.startPathTool()
        //     return
        // }
        return false
    }
  },
  mounted() {
  }
};
</script>