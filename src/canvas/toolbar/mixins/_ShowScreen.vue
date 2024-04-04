<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import _Tooltip from 'common/_Tooltip'

export default {
    name: '_Show',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
			colorWidgets: []
      }
	},
    components: {},
	computed: {
	},
    methods: {

		/*****************************************************************************************************
		* screen properties
		****************************************************************************************************/

		showScreenProperties (model){
			this.logger.log(0,"showScreenProperties", "entry");


			this.showProperties();

			if (this.isDataView) {
				return this.showScreenDataProperties(model)
			}


			if (this.isDesignView) {
				this.showScreenDesignProperties(model)
			}

			if (this.isPrototypeView) {
				this.showScreenPrototypeProperties(model)
			}


			this.restorePropertiesState();

			this.logger.log(2,"showScreenProperties", "exit");
		},

		showScreenPrototypeProperties (model) {
				this.logger.log(-1,"showScreenPrototypeProperties", "entry");

				if (this.screenName) {
					if(model.name){
						this.screenName.value = model.name;
					} else {
						this.screenName.value = "";
					}
					this.screenName.blur();
					css.remove(this.screenNameDiv, "MatcToolbarSectionHidden");
				}

				css.add(this.screenSize.domNode, 'MatcHidden')
			

				if(this.screenActionDiv){
					css.remove(this.screenActionDiv, "MatcToolbarSectionHidden");
					this.screenActionBTN.setScreen(model);
				}
				if(this.screenAnimationDiv){
					css.remove(this.screenAnimationDiv, "MatcToolbarSectionHidden")
				}
		},

		showScreenDesignProperties (model) {

				this.showDesignTokenBtns(model, 'screen')

				if(this.screenDIV){
					css.remove(this.screenDIV, "MatcToolbarSectionHidden");
				}

				css.remove(this.screenShapeDiv, "MatcToolbarSectionHidden");
				css.remove(this.screenBackDiv, "MatcToolbarSectionHidden");
				css.remove(this.screenImageDiv, "MatcToolbarSectionHidden");
				css.remove(this.screenParentsDiv, "MatcToolbarSectionHidden");
				css.remove(this.screenDownloadDiv, "MatcToolbarSectionHidden");

				var style = model.style;
				if (style) {

					this.screenStart.setValue(model.props.start);
					this.screenBackgroundImage.setValue(style.backgroundImage);
					this.screenBackgroundImage.setModel(this.model);

					/**
					 * Since 5.0.3 we support image repeats
					 */
					if (style.backgroundImage) {
						css.remove(this.screenImageRepeatDiv, "MatcToolbarSectionHidden")
					} else {
						css.add(this.screenImageRepeatDiv, "MatcToolbarSectionHidden")
					}
					this.screenImageRepeat.setValue(style.backgroundImageRepeat)


					this.screenBackgroundColor.setValue(style.background);
					this.screenBackgroundColor.setBox(model)
					this.screenOverlayCheckBox.setValue(style.overlay);

					/**
					* Since 2.2.2 we show the segemnt box
					*/
					if (this.screenSegmentCheckbox) {
						this.screenSegmentCheckbox.setValue(model.segment)
						css.remove(this.screenSegmentCheckbox.domNode, "hidden");
					}

					if(style.overlay){
						css.remove(this.screenFixedOverlayCheckBox.domNode, "hidden");
						css.remove(this.screenBlurOverlayCheckBox.domNode, "hidden");
						css.remove(this.screenBackgroundOverlayCheckBox.domNode, "hidden")
					} else {
						css.add(this.screenFixedOverlayCheckBox.domNode, "hidden");
						css.add(this.screenBlurOverlayCheckBox.domNode, "hidden");
						css.add(this.screenBackgroundOverlayCheckBox.domNode, "hidden")
					}
					this.screenFixedOverlayCheckBox.setValue(style.fixed);
					this.screenBlurOverlayCheckBox.setValue(style.blur);
					this.screenBackgroundOverlayCheckBox.setValue(style.hasBackground);
				} else {
					console.warn("_Render.showScreenProperties() > No Style", model)
				}

				this.screenParentList.setScreen(model);
				//this.childWidget.setScreen(model);

				if (this.screenName) {
					if(model.name){
						this.screenName.value = model.name;
					} else {
						this.screenName.value = "";
					}
					this.screenName.blur();
				}

				if(this.screenDownLoad) {
					css.remove(this.screenDownLoad.domNode, "MatcHidden")
					this.screenDownLoad.setModel(this.model, model.id);
				}
				if(this.screenExport) {
					this.screenExport.setScreen(model, model.id);
				}

				if(this.screenSize){
					css.remove(this.screenSize.domNode, 'MatcHidden')
					this.screenSize.setModel(this.model);
					this.screenSize.setValue(model);
				}

		},


		showScreenDataProperties (model) {
			this.showProperties();

			if (this.screenName) {
				if(model.name){
					this.screenName.value = model.name;
				} else {
					this.screenName.value = "";
				}
				this.screenName.blur();
			}

			css.add(this.screenSize.domNode, 'MatcHidden')
			css.remove(this.screenNameDiv, "MatcToolbarSectionHidden");
			css.remove(this.callBackDiv, "MatcToolbarSectionHidden")
			this.callbackSection.setValue(model, 'screen')
		}

    },
    mounted () {
    }
}
</script>