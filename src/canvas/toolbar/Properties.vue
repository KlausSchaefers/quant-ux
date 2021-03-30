
<template>
     <div class="MatcToobarPropertiesSection">

       Properties

		</div>

</template>
<script>

import Util from 'core/Util'


export default {
  name: 'Properties',
	mixins:[Util],
	props:['pub', 'model'],
    data: function () {
        return {

        }
    },
	components: {
	},
	computed: {
		hasProtoMoto () {
			return this.settings && this.settings.hasProtoMoto
		}
	},
  methods: {
  },
  mounted () {
  }
}

/**
 *
			render:function(){
				this.logger.log(3,"render", "entry");


				this.properties = document.createElement("div");
				css.add(this.properties, "MatcToobarPropertiesSectionCntr")

				this._renderGroupName();

				this._renderGroupResponsive();

				this._renderGroupAction();

				this._renderWidgetName();

				this._renderWidgetResponsive();

				this._renderInheritedWidget()

				this._renderWidgetLine();



				this._renderData();

				this._renderValidation();

				this._renderWidgetView();

				this._renderWidgetBackground();

				this._renderWidgetBorder();

				this._renderWidgetText();

				this._renderWidgetBox();


				this._renderScreenName();

				this._renderScreen();

				this._renderScreenBackground();

				this._renderScreenActions();

				this._renderScreenInheritance();

				this._renderScreenDownload();

				this._renderLowCode();

				this._renderRuler();

				this.hideAllSections();


				this.scroller = this.$new(ScrollContainer);
				this.scroller.placeAt(this.propertiesCntr);
				this.scroller.wrap(this.properties, 40);

				this.renderToolTips();

				this.hideNotNeededButtons();
				this.initIcons();
			},

 */
</script>
