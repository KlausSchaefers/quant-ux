<script>

export default {
    name: 'Collab',
    mixins:[],
    data: function () {
        return {
            collabMousePositions: {},
            collabUsers: []
        }
    },
    components: {},
    methods: {

      setCollabMouse (user, pos) {
        let zoomedPOs = this.getZoomedBox(pos, this.zoom, this.zoom);
        this.collabMousePositions[user.id] = {
          pos: zoomedPOs,
          user: user
        }
        this.renderCollabMousePosition(this.collabMousePositions)
      },

      addCollabUser (user) {
        const found = this.collabUsers.find(u => u.id === user.id)
        if (!found) {
          this.collabUsers.push(user)
          this.showSuccess('' + this.getUserName(user) + ' is here...')
        }
      },

      removeCollabUser (user) {
        this.removeUserMouse(user.id)
        this.collabUsers = this.collabUsers.filter(u => u.id !== user.id)
        this.showSuccess('' + this.getUserName(user) + ' left the building...')
      }

    },
    mounted () {
    }
}
</script>