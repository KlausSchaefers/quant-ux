<script>


import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import BoxSize from 'canvas/toolbar/components/BoxSize'
import DomBuilder from 'common/DomBuilder'

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

        _renderSVGEditButton () {
            const parent = this.createSection("Paths");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

        	var db = new DomBuilder();
       		var btn = db
				.div("MatcToolbarItem MatcToolbarGridFull")
				.div(" MatcToolbarButton MatcButton", "Edit")
				.tooltip("Edit Paths")
				.build(content);

            this.own(on(btn, 'click', lang.hitch(this, 'onToolSVG')))


            this.properties.appendChild(parent);
            this.svgButtonDiv = parent;
        },

        _renderSVGBox () {

	        const parent = this.createSection("Path");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.svgPathName = this.createInput(content, "Path Name");
			this.own(on(this.svgPathName, "change", lang.hitch(this, "onSVGChangePathName")));

			let scvSizeDiv = document.createElement("div");
			content.appendChild(scvSizeDiv)

			this.svgPathSize = this.$new(BoxSize, {isHoverParent: true});
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
            this.logger.log(-1,"onSVGChangePathName", "entry > ", this.svgPathName.value);
            const name = this.svgPathName.value
            if (this.currentTool) {
                this.currentTool.renameSelection(name)
            }
        },

        setSVGBoundingBox (value) {
            this.logger.log(-1,"setSVGBoundingBox", "entry > ", this.currentTool);
            if (this.currentTool) {
                this.currentTool.resizeSelection(value)
            }
        },


        showSVGProperties(paths, bbox) {
		    this.logger.log(1,"showSVGProperties", "entry > ", bbox);
			this.restorePropertiesState();
            this.showProperties();

            if (this._selectionPaths.length === 1) {
                const path = this._selectionPaths[0]
                this.svgPathName.value = path.name
                css.remove(this.svgBoxDiv, "MatcToolbarSectionHidden");
              
                // here is a little fuckup,, because the bounding box is scalled 
                // on the fly
			    this.svgPathSize.setModel(this.model);
			    this.svgPathSize.setValue(bbox);
                

            } else {
                css.add(this.svgBoxDiv, "MatcToolbarSectionHidden");
            }

            
		
        }


    }
}
</script>