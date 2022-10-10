<script>


import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import SVGSize from 'canvas/toolbar/components/SVGSize'
import ToolbarColor from 'canvas/toolbar/components/ToolbarColor'
import SVGStroke from 'canvas/toolbar/components/SVGStroke'
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

            this.own(on(btn, 'click', lang.hitch(this, 'onToolEditSVG')))


            this.properties.appendChild(parent);
            this.svgButtonDiv = parent;
        },

        _renderSVGBox () {

	        const parent = this.createSection("Path");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.svgPathName = this.createInput(content, "Path Name");
            css.add(this.svgPathName, "MatcToobarNameInput")
			this.own(on(this.svgPathName, "change", lang.hitch(this, "setSVGPathName")));

			let scvSizeDiv = document.createElement("div");
			content.appendChild(scvSizeDiv)

			this.svgPathSize = this.$new(SVGSize, {isHoverParent: true});
			this.own(on(this.svgPathSize, "change", lang.hitch(this, "setSVGBoundingBox")));
			this.svgPathSize.placeAt(scvSizeDiv);

			this.properties.appendChild(parent);
			this.svgBoxDiv = parent;
		
        },

        _renderSVGStroke () {

            const parent = this.createSection("Stroke");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

            this.svgStrokeBox = this.$new(SVGStroke);
			this.svgStrokeBox.setModel(this.model);
			//this.svgBackgroundColor.setCssProps(['background'])
			this._placeAt(this.svgStrokeBox, content);
			this.own(on(this.svgStrokeBox, "change", lang.hitch(this, "setSVGPathStyle", false)));
			this.own(on(this.svgStrokeBox, "changing", lang.hitch(this, "setSVGPathStyle", true)));


            this.properties.appendChild(parent);
			this.svgStrokeDiv = parent;
        },

        _renderSVGFill () {
            const parent = this.createSection("SVG Fill");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

            this.svgFillColor = this.$new(ToolbarColor, {hasGradient : true, hasPicker:true, chevron:false, hex:true});
			this.svgFillColor.updateLabel = true;
			this.svgFillColor.keepOpenOnTypeSelection = "svgPaths";
			this.svgFillColor.setModel(this.model);
			//this.svgBackgroundColor.setCssProps(['background'])
			this._placeAt(this.svgFillColor, content);
			this.own(on(this.svgFillColor, "change", lang.hitch(this, "setSVGFill", false)));
			this.own(on(this.svgFillColor, "changing", lang.hitch(this, "setSVGFill", true)));


            this.properties.appendChild(parent);
			this.svgFillDiv = parent;
        },


        showSVGProperties(paths, bbox) {
		    this.logger.log(1,"showSVGProperties", "entry > ", bbox);
			this.restorePropertiesState();
            this.showProperties();

            if (this._selectionPaths.length === 1) {
                css.remove(this.svgBoxDiv, "MatcToolbarSectionHidden");
                css.remove(this.svgFillDiv, "MatcToolbarSectionHidden");
                css.remove(this.svgStrokeDiv, "MatcToolbarSectionHidden");

                const path = this._selectionPaths[0]
                this.svgPathName.value = path.name
                this.svgFillColor.setValue(path.fill)
                this.svgStrokeBox.setModel(this.model)
                this.svgStrokeBox.setValue(path)
              
			    this.svgPathSize.setModel(this.model);
			    this.svgPathSize.setValue(bbox);
                
            } else {
                css.add(this.svgBoxDiv, "MatcToolbarSectionHidden");
            }
        },

        onSVGPathsMoved (paths, bbox) {
            this.logger.log(1,"onSVGPathsMoved", "entry > ", bbox);
			this.svgPathSize.setValue(bbox);
        },


        setSVGPathStyle (temp, key, value) {
            this.logger.log(-1,"setSVGPathStyle", "entry > " +  key, value);
            if (this.currentTool) {
                if (temp) {
                    this.currentTool.tempStyleSelection(key, value)   
                } else {
                    this.currentTool.styleSelection(key, value)
                }
            }
        },

        setSVGFill (temp, color) {
            this.logger.log(-1,"setSVGFill", "entry > ", color, temp);
            if (this.currentTool) {
                if (temp) {
                    this.currentTool.tempStyleSelection('fill', color)   
                } else {
                    this.currentTool.styleSelection('fill', color)
                }
            }
        },

        setSVGPathName () {
            this.logger.log(1,"onSVGChangePathName", "entry > ", this.svgPathName.value);
            const name = this.svgPathName.value
            if (this.currentTool) {
                this.currentTool.renameSelection(name)
            }
        },

        setSVGBoundingBox (value, type) {
            this.logger.log(1,"setSVGBoundingBox", "entry > " + type, value);
            if (this.currentTool) {
                this.currentTool.resizeSelection(value, type)
            }
        },



    }
}
</script>