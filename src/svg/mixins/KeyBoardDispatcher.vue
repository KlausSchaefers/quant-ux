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
        const isCntrl = e.ctrlKey || e.metaKey;
        //const isShift = e.shiftKey


        if (e.key === 'Escape') {
            this.onEsc()
        }
        if (e.key === 'Enter') {
            this.onEnter()
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            this.onDelete()
        }
        if (e.key === 'v') {
            this.startBezierTool()
        }
        if (e.key === 'l') {
            this.startPathTool()
        }

        if (isCntrl) {
            this.stopEvent(e)
            if (e.key === 'ArrowUp') {
                this.moveSelectedPathToTop(true)
            }
            if (e.key === 'ArrowDown') {
                this.moveSelectedPathToBottom(true)
            }
        }
    }
  },
  mounted() {
  }
};
</script>