<template>
  <div class="MatcSimulator MatcAnimtationPlayer">
  </div>
</template>
<script>


import AnimationPlayer from 'player/AnimationPlayer'

export default {
	name: 'Player',
	props: ['animation'],
    mixins:[],
    data: function () {
        return {
      
        }
    },
    components: {
		
	},
    methods: {
		setPlayer (animation) {
			this.player = new AnimationPlayer()
			this.player.placeAt(this.$el)
			this.player.setModel(animation)
		}
    }, 
    mounted () {
		this.setPlayer(this.animation)
	},
    beforeDestroy: function() {
		if (this.player) {
			this.player.destroy()
		}
    }
}
</script>