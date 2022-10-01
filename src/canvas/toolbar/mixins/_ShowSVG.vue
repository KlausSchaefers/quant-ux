<script>


import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import BoxSize from 'canvas/toolbar/components/BoxSize'


export default {
    name: '_ShowSVG',
    mixins:[],
    data: function () {
    	return {
			colorWidgets: []
      	}
	},
    components: {},
	computed: {
	},
    methods: {

        _renderSVGBox () {

	        const parent = this.createSection("Path");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.svgPathName = this.createInput(content, "Path Name");
			this.own(on(this.svgPathName, "change", lang.hitch(this, "onSVGChangePathName")));

			let scvSizeDiv = document.createElement("div");
			content.appendChild(scvSizeDiv)

			this.svgPathSize = this.$new(BoxSize);
			this.own(on(this.svgPathSize, "change", lang.hitch(this, "setSVGBoundingBox")));
			this.svgPathSize.placeAt(scvSizeDiv);

			this.properties.appendChild(parent);
			this.svgBoxDiv = parent;
		
        },

        _renderSVGColor () {

        },

        _renderSVGFill () {

        },

        onSVGChangePathName () {
            this.logger.log(1,"onSVGChangePathName", "entry > ", this.svgPathName.value);
        },

        setSVGBoundingBox (value) {
            this.logger.log(1,"setSVGBoundingBox", "entry > ", value);
        },


        showSVGProperties(widget, paths) {
		    this.logger.log(1,"showSVGProperties", "entry > ", widget, paths);
			this.restorePropertiesState();
            this.showProperties();


            css.remove(this.svgBoxDiv, "MatcToolbarSectionHidden");
		
        }


    }
}
</script>