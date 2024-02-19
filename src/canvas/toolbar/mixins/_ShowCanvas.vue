<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
//import lang from 'dojo/_base/lang'
import _Tooltip from 'common/_Tooltip'

export default {
    name: '_ShowCanvas',
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

      showCanvas () {
			  this.logger.log(1,"showCanvas", "entry > ");

        if (!this.getSettings().hasDesignToken) {
          return
        }

        this.showProperties(false);

        css.remove(this.designTokenDiv, "MatcToolbarSectionHidden")
        css.remove(this.designTokenDownloadDiv, "MatcToolbarSectionHidden")

        this.designTokenList.setModel(this.model)
        this.designTokenExport.setDesignTokens(this.model.designtokens)

      }

    },
    mounted () {
    }
}
</script>