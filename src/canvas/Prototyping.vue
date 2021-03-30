<script>

import css from 'dojo/css'


export default {
    name: 'PrototypingView',
    mixins:[],
    data: function () {
        return {
            hasPrototypingView: false
        }
    },
    components: {},
    methods: {
        setPrototypingView (value) {
            this.logger.log(-1,"setPrototypingView", "enter", value);
            if (value === true) {
                css.add(this.container, "MatcCanvasPrototypingView");
                this.hasPrototypingView = true
            } else {
                css.remove(this.container, "MatcCanvasPrototypingView");
                this.hasPrototypingView = false
            }
        }
    },
    mounted () {
    }
}
</script>