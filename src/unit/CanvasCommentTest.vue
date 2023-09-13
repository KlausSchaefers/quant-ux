<template>
    <div class="MatcLight">
        <h1>CanvasComment Test</h1>
        <div class="MatcCanvasComment MatcCanvasCommentOpen" style="" ref="cntr">

        </div>

        <div class="MatcCanvasComment MatcCanvasCommentOpen" ref="cntr2" style="left:400px"></div>

            <div class="MatcCanvasComment MatcCanvasCommentOpen" ref="cntr3" style="left:800px">
</div>

    </div>
</template>
  
<style lang="sass">
  @import "../style/bulma.sass"
</style>

<style lang="scss">
@import "../style/matc.scss";
@import "../style/toolbar/all.scss";
</style>
<style>
.MatcCanvasComment {
   margin: 50px;
}
</style>
  
<script>

import CanvasComment from '../page/CanvasComment.vue'
import * as DojoUtil from 'dojo/DojoUtil';

export default {
    name: "ColorPickerTest",
    mixins: [],
    data: function () {
        return {

        };
    },
    components: {
    },
    methods: {

    },
    mounted() {
        this.colorPicker = DojoUtil.$new(CanvasComment, { hasGradient: true })
        this.colorPicker.placeAt(this.$refs.cntr)
        this.colorPicker.setUser({
            id: "5574b075ee1a410e08e9f15d"
        })
        this.colorPicker.setValue({
            "_id": "6501d83651909a539c29d118",
            "message": "aasdasd",
            "reference": "canvas",
            "type": "ScreenComment",
            "user": {
                "_id" : "5574b075ee1a410e08e9f15d",
                "email" : "klaus.schaefers@gmail.com",
                "name" : "Klaus2",
                "lastname" : "Schaefers",
                "image" : "1694630697644.png",
                "id" : "5574b075ee1a410e08e9f15d"
            },
            "userID": "56460040ee1a411d1648065e",
            "created": 1694619702886,
            "number": 1,
            "x": 1291.5,
            "y": 1162,
            "appID": "64ff55b751909a539c28bda7",
            "id": "6501d83651909a539c29d118"
        })

        this.colorPicker = DojoUtil.$new(CanvasComment, { hasGradient: true })
        this.colorPicker.placeAt(this.$refs.cntr2)
        this.colorPicker.setValue({
            "_id": "6501d83651909a539c29d118",
            "message": "aasdasd",
            "reference": "canvas",
            "type": "ScreenComment",
            "user": {
                "_id": "56460040ee1a411d1648065e",
                "email": "klaus.schaefers@quant-ux.com",
                "name": "Klaus",
                "lastname": "Schaefers",
                "id": "56460040ee1a411d1648065e"
            },
            "userID": "56460040ee1a411d1648065e",
            "created": 1694619702886,
            "number": 1,
            "x": 1291.5,
            "y": 1162,
            "appID": "64ff55b751909a539c28bda7",
            "id": "6501d83651909a539c29d118"
        })

        this.colorPicker = DojoUtil.$new(CanvasComment, { hasGradient: true })
        this.colorPicker.placeAt(this.$refs.cntr3)
        this.colorPicker.setValue({
            "_id": "6501d83651909a539c29d118",
            "message": "aasdasd",
            "reference": "canvas",
            "type": "ScreenComment",
            "user": {
                "role": "guest"
            },
            "userID": "56460040ee1a411d1648065e",
            "created": 1694619702886,
            "number": 1,
            "x": 1291.5,
            "y": 1162,
            "appID": "64ff55b751909a539c28bda7",
            "id": "6501d83651909a539c29d118"
        })
    }
};
</script>
  