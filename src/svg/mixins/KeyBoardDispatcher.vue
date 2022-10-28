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
        if (e.key === 'Alt') {
            return true
        }
        return true
    },
    onKeyDown (e) {

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

        if (e.key === 'Alt') {
            return true
        }
      
        if (this.isMultiPath) {
            const isCntrl = e.ctrlKey || e.metaKey;
            if (isCntrl) {
                this.stopEvent(e)
                if (e.key === 'ArrowUp') {
                    this.moveSelectedPathToTop(true)
                    return true
                }
                if (e.key === 'ArrowDown') {
                    this.moveSelectedPathToBottom(true)
                    return true
                }
                if (e.key === 'c') {
                    this.copySelection()
                    return true
                }

                if (e.key === 'v') {
                    this.pasteSelection()
                    return true
                }
            }

            if (e.key === 'v') {
                this.startBezierTool()
                return true
            }
            if (e.key === 'l') {
                this.startPathTool()
                return true
            }
        }
        return false
    }
  },
  mounted() {
  }
};
</script>