<script>
import win from 'dojo/win'

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
      },

      moveToCollabUser (user) {
        if (this.collabMousePositions[user.id]) {

          try {
            let pos = this.collabMousePositions[user.id].pos
            
            var winBox = win.getBox();
            var xOffSetScreen = pos.x;
            var xOffSetWindow = (winBox.w/2)+ Math.abs(this.canvasPos.x);
            let x = this.canvasPos.x + (xOffSetWindow - xOffSetScreen) - 100;

            var yOffSetScreen = pos.y;
            var yOffSetWindow = Math.min(winBox.h/2,200)+ Math.abs(this.canvasPos.y);
            let y = this.canvasPos.y + (yOffSetWindow - yOffSetScreen) - 100;

            if (!isNaN(x) && !isNaN(y)) {
              this.canvasPos.y = y
              this.canvasPos.x = x
              this.setContainerPos();
              this.showSuccess('Moving to ' + this.getUserName(user) + ' ')
            }

          } catch (err) {
    	      this.logger.error("moveToCollabUser", "enter > ", err);
          }
 
        }
      },

    },
    mounted () {
    }
}
</script>