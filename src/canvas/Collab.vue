<script>

export default {
    name: 'Collab',
    mixins:[],
    data: function () {
        return {
            collabMousePositions: {}
        }
    },
    components: {},
    methods: {


      setCollabMouse (user, pos) {
        this.collabMousePositions[user.id] = {
          pos: pos,
          user: user
        }
        this.renderCollabMousePosition(this.collabMousePositions)
      },

      removeCollabUser (user) {
        this.removeUserMouse(user.id)
      }

    },
    mounted () {
    }
}
</script>