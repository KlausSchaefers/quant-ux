<script>


import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import SVGSize from 'canvas/toolbar/components/SVGSize'
import ToolbarColor from 'canvas/toolbar/components/ToolbarColor'
import SVGStroke from 'canvas/toolbar/components/SVGStroke'
import ImageRotate from 'canvas/toolbar/components/ImageRotate'
//import ToolbarSelector from 'canvas/toolbar/components/ToolbarSelector'
import ToolbarDropDownButton from 'canvas/toolbar/components/ToolbarDropDownButton'
import SVGStrokeStyle from '../components/SVGStrokeStyle'
import DomBuilder from 'common/DomBuilder'

export default {
    name: '_ShowSVG',
    mixins:[],
    data: function () {
    	return {

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
				.div("MatcToolbarItem")
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

			// this.svgPathName = this.createInput(content, "Path Name");
            // css.add(this.svgPathName, "MatcToobarNameInput")
			// this.own(on(this.svgPathName, "change", lang.hitch(this, "setSVGPathName")));

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



            const row = document.createElement("div");
            css.add(row, 'MatcToobarRow')
            content.appendChild(row)

            this.svgStrokeBox = this.$new(SVGStroke);
			this.svgStrokeBox.setModel(this.model);
			this._placeAt(this.svgStrokeBox, row);
			this.own(on(this.svgStrokeBox, "change", lang.hitch(this, "setSVGPathStyle", false)));
			this.own(on(this.svgStrokeBox, "changing", lang.hitch(this, "setSVGPathStyle", true)));

            
            const row2 = document.createElement("div");
            css.add(row2, 'MatcToobarRow MatcToobarRowFlex')
            content.appendChild(row2)

            this.svgStrokeArrowLeft = this.$new(ToolbarDropDownButton,  {isIconButton:true, hasCaret: false});
            this.svgStrokeArrowLeft.reposition = true;
            this.svgStrokeArrowLeft.setPopupCss("MatcActionAnimProperties");
		    this.svgStrokeArrowLeft.setOptions([
                { value:null, label: 'None', icon: 'SVGNone'},
                { value:"arrowStart", label:'Arrow', icon: 'SVGArrowLeft'},
                { value:"triangleStart", label:'Triangle', icon: 'SVGTriangle'},
                { value:"circle", label:'Circle', icon: 'SVGCirlce'}
            ]);
            this.own(on(this.svgStrokeArrowLeft, "change", lang.hitch(this, "setSVGPathStyle", false, "markerStart")));
            this._placeAt(this.svgStrokeArrowLeft, row2);


            this.svgStrokeArrowRight = this.$new(ToolbarDropDownButton,  {isIconButton:true, hasCaret: false});
            this.svgStrokeArrowRight.reposition = true;
            this.svgStrokeArrowRight.setPopupCss("MatcActionAnimProperties");
		    this.svgStrokeArrowRight.setOptions([
                { value:null, label: 'None', icon: 'SVGNone'},
                { value:"arrowEnd", label:'Arrow', icon: 'SVGArrowRight'},
                { value:"triangleEnd", label:'Triangle', icon: 'SVGTriangle'},
                { value:"circle", label:'Circle', icon: 'SVGCirlce'}
            ]);
            this.own(on(this.svgStrokeArrowRight, "change", lang.hitch(this, "setSVGPathStyle", false, "markerEnd")));
            this._placeAt(this.svgStrokeArrowRight, row2);
            

            // this.svgStrokeDashArray = this.$new(ToolbarDropDownButton,  {isIconButton: true});
            // this.svgStrokeDashArray.reposition = true;
            // this.svgStrokeDashArray.setPopupCss("MatcActionAnimProperties");
		    // this.svgStrokeDashArray.setOptions([
            //     { value:null, label: 'Solid', icon: 'SVGStrokeIcon SVGStrokeIconStyle SVGStrokeIconStyleSolid'},
            //     { value:"5,5", label:'Small Dash', icon: 'SVGStrokeIcon SVGStrokeIconStyle SVGStrokeIconStyleDashSmall'},
            //     { value:"10,10", label:"Long Dash", icon: 'SVGStrokeIcon SVGStrokeIconStyle SVGStrokeIconStyleDashMedium'}
            // ]);
            // this.own(on(this.svgStrokeDashArray, "change", lang.hitch(this, "setSVGPathStyle", false, "strokeDash")));
            // this._placeAt(this.svgStrokeDashArray, row2);

            
            this.svgStrokeCap = this.$new(ToolbarDropDownButton,  {isIconButton:true, hasCaret: false});
            this.svgStrokeCap.reposition = true;
            this.svgStrokeCap.setPopupCss("MatcActionAnimProperties");
		    this.svgStrokeCap.setOptions([
                { value:null, label: 'Square Line Caps', icon: 'SVGStrokeSquare'},
                { value:"round", label:'Round Line Caps', icon: 'SVGStrokeRound'},
            ]);
            this.own(on(this.svgStrokeCap, "change", lang.hitch(this, "setSVGPathStyle", false, "strokeLineCap")));
            this._placeAt(this.svgStrokeCap, row2);


            this.svgStrokeStyle = this.$new(SVGStrokeStyle)
            this.own(on(this.svgStrokeStyle, "change", lang.hitch(this, "setSVGPathStyle", false)));
            this.own(on(this.svgStrokeStyle, "changing", lang.hitch(this, "setSVGPathStyle", true)));
            this._placeAt(this.svgStrokeStyle, row2);

            this.properties.appendChild(parent);
			this.svgStrokeDiv = parent;
        },

        _renderSVGTransform () {

            const parent = this.createSection("Transform");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

            let svgRotateDiv = document.createElement("div");
			content.appendChild(svgRotateDiv)

            this.svgRotate = this.$new(ImageRotate);
			this.own(on(this.svgRotate, "change", lang.hitch(this, "setSVGPathRotation", false)));
			this.own(on(this.svgRotate, "changing", lang.hitch(this, "setSVGPathRotation", true)));
			this._placeAt(this.svgRotate, svgRotateDiv);
		
            this.properties.appendChild(parent);
			this.svgTransformDiv = parent;
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
			this._placeAt(this.svgFillColor, content);
			this.own(on(this.svgFillColor, "change", lang.hitch(this, "setSVGFill", false)));
			this.own(on(this.svgFillColor, "changing", lang.hitch(this, "setSVGFill", true)));


            this.properties.appendChild(parent);
			this.svgFillDiv = parent;
        },


        onSVGPathsSelected (paths, bbox) {
			this.logger.log(3,"onSVGPathsSelected", "enter", paths);
			try{
				this.cleanUp();
				this._selection = "svgPaths";
				this._selectionPaths = paths
				this.showSVGProperties(paths, bbox)
			} catch(e){
				console.error(e);
				this.logger.sendError(e);
			}
		},


        showSVGWidgetProperties (model) {
            this.logger.log(1,"showSVGWidgetProperties", "entry > ", model);

            css.remove(this.svgFillDiv, "MatcToolbarSectionHidden");
            css.remove(this.svgStrokeDiv, "MatcToolbarSectionHidden");
        
            this.svgStrokeBox.setModel(this.model)
		    this.svgPathSize.setModel(this.model);

            if (model.props.paths) {
                const path = model.props.paths[0]           
                this._setPathProps(path)
            }
        },


        showMultiSVGWidgetProperties (ids) {
            this.logger.log(1,"showSVGWidgetProperties", "entry > ", ids);

            css.remove(this.svgFillDiv, "MatcToolbarSectionHidden");
            css.remove(this.svgStrokeDiv, "MatcToolbarSectionHidden");

            this.svgStrokeBox.setModel(this.model)
		    this.svgPathSize.setModel(this.model);

            // TODO: this could be somehopw nice, now
            // we just take the color of the first element
            const model = this.model.widgets[ids[0]]
            if (model && model.props.paths) {
                const path = model.props.paths[0]
                this._setPathProps(path)
            }
        },


        showSVGProperties(paths, bbox) {
		    this.logger.log(1,"showSVGProperties", "entry > ", bbox);

            this.showWidgetTools();
            this.showProperties();

            this.svgStrokeBox.setModel(this.model)
		    this.svgPathSize.setModel(this.model);
            if (this._selectionPaths.length === 1) {
                css.remove(this.svgBoxDiv, "MatcToolbarSectionHidden");
                css.remove(this.svgFillDiv, "MatcToolbarSectionHidden");
                css.remove(this.svgStrokeDiv, "MatcToolbarSectionHidden");
                css.remove(this.svgTransformDiv, "MatcToolbarSectionHidden")

                const path = this._selectionPaths[0]

                //this.svgPathName.value = path.name
  
			    this.svgPathSize.setValue(bbox);
                this.svgRotate.setValue(path.angle);
                this._setPathProps(path)
             
                
            } else if (this._selectionPaths.length > 1){
                css.add(this.svgBoxDiv, "MatcToolbarSectionHidden");
                css.remove(this.svgFillDiv, "MatcToolbarSectionHidden");
                css.remove(this.svgStrokeDiv, "MatcToolbarSectionHidden");
                css.remove(this.svgTransformDiv, "MatcToolbarSectionHidden")

                const path = this._selectionPaths[0]
                this._setPathProps(path)

            } else {
                this.logger.log(1,"showSVGProperties", "wrong selected paths ");
            }
        },

        _setPathProps (path) {
            this.svgFillColor.setValue(path.fill)             
            this.svgStrokeBox.setValue(path)
            // this.svgStrokeDashArray.setValue(path.strokeDash)
            this.svgStrokeStyle.setValue(path.strokeDash)
            this.svgStrokeCap.setValue(path.strokeLineCap)
            this.svgStrokeArrowRight.setValue(path.markerEnd)
            this.svgStrokeArrowLeft.setValue(path.markerStart)
        },

        showSVGPathProps (pathID, key, value) {
            this.logger.log(1,"onSVGPathsMoved", "entry > ", value);
            if (key === 'name') {
                this.svgPathName.value = value
            }
        },

        onSVGPathsMoved (paths, bbox) {
            this.logger.log(1,"onSVGPathsMoved", "entry > ", bbox);
			this.svgPathSize.setValue(bbox);
        },

        setSVGFill (temp, color) {
            this.logger.log(-1,"setSVGFill", "entry > ", color, temp);
            this.setSVGPathStyle(temp, 'fill', color)
        },

        setSVGPathStyle (temp, key, value) {
            if (this.currentTool && this._selectionPaths) {
                this.logger.log(1,"setSVGPathStyle", "entry > PATHS" +  key, value);
                if (temp) {
                    this.currentTool.tempStyleSelection(key, value)   
                } else {
                    this.currentTool.styleSelection(key, value)
                }
            } else {
                this.logger.log(1,"setSVGPathStyle", "entry > WIDGET" +  key, value);
                if (temp) {
                    this.setTempSVGWidgetProps(key, value)
                } else {
                    this.setSVGWidgetProps(key, value)
                }
            }
        },

        setSVGPathRotation (temp, value) {
            this.logger.log(1,"setSVGPathRotation", "entry > ", value);
            if (this.currentTool && this._selectionPaths) {
                this.currentTool.rotateSelection(value , !temp)
            }
        },

        setSVGWidgetProps (key, value){
			this.logger.log(2,"setSVGWidgetProps", "entry > " + key + " - "+ value);
            if(this._selectedWidget){
                const newProps = this.updateSVGPathsProps(this._selectedWidget, key, value)
                this.controller.updateSVGWidgetProps(this._selectedWidget.id, newProps)
            } else if(this._selectedMulti){
                for (var i=0; i < this._selectedMulti.length; i++){
                    const widgetID = this._selectedMulti[i]
                    const widget = this.model.widgets[widgetID]
                    if (widget) {
                        const newProps = this.updateSVGPathsProps(widget, key, value)
                        this.controller.updateSVGWidgetProps(widgetID, newProps)
                    }
                }
            }
			return false;
		},

        setTempSVGWidgetProps (key, value){
			this.logger.log(2,"setTempSVGWidgetProps", "entry > " + key + " - "+ value);
			const modelKey = this._getViewStyleModelKey();
			if ("style" === modelKey) {			
				if(this._selectedWidget){
                    const newProps = this.updateSVGPathsProps(this._selectedWidget, key, value)
					this.canvas.setTempWidgetProps(this._selectedWidget.id, newProps);
				} else if(this._selectedMulti){
					for (var i=0; i < this._selectedMulti.length; i++){
                        const widgetID = this._selectedMulti[i]
                        const widget = this.model.widgets[widgetID]
                        if (widget) {
                            const newProps = this.updateSVGPathsProps(widget, key, value)
        					this.canvas.setTempWidgetProps(widgetID, newProps);
                        }
					}
				}
			}
			return false;
		},

        updateSVGPathsProps (widget, key, value) {
            const result = lang.clone(widget.props)
            result.paths.forEach(p => {
                p[key] = value
            })
            return result
        },

      

        setSVGPathName () {
            this.logger.log(1,"onSVGChangePathName", "entry > ", this.svgPathName.value);
            const name = this.svgPathName.value
            if (this.currentTool && this._selectionPaths) {
                this.currentTool.renameSelection(name)
            }
            // FIXME|: we shoudl also call the layer list
        },

        setSVGBoundingBox (value, type) {
            this.logger.log(1,"setSVGBoundingBox", "entry > " + type, value);
            if (this.currentTool && this._selectionPaths) {
                this.currentTool.resizeSelection(value, type)
            }
        },

        onSVGCommandStackChange (hasUndo, hasRedo) {
            this.logger.log(1,"onSVGCommandStackChange", "entry > ");
            if (this.$refs.svgUndo) {
                if (hasUndo) {
                    css.remove(this.$refs.svgUndo, 'MatcToolbarItemDisbaled')
                } else {
                    css.add(this.$refs.svgUndo, 'MatcToolbarItemDisbaled')
                }
            }

            if (this.$refs.svgRedo) {
                if (hasRedo) {
                    css.remove(this.$refs.svgRedo, 'MatcToolbarItemDisbaled')
                } else {
                    css.add(this.$refs.svgRedo, 'MatcToolbarItemDisbaled')
                }
            }
        },

        onSVGUndo () {
            if (this.currentTool) {
				this.currentTool.undo()
				return
			}
        },

        onSVGRedo () {
            if (this.currentTool) {
				this.currentTool.redo()
				return
			}
        }


    }
}
</script>