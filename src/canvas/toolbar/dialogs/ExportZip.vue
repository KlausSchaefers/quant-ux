
<template>
  <div class="MatcExportZip">

    <span class="MatcToolbarScreenListPreviewWrapper MatcCreateBtnElement MatcToolbarDropDownButtonItem" @click="downloadZip">
        <span class="mdi mdi-file-code-outline"/>
    </span>


	</div>
</template>
<style lang="scss">
    @import '../../../style/components/import_dialog.scss';
    @import '../../../style/components/export_dialog.scss';
</style>

<script>


import Logger from 'common/Logger'
import ZipSevice from 'services/ZipService'
import { saveAs } from 'file-saver';

export default {
    name: 'ExportZip',
    mixins:[],
    props:['model', 'jwtToken'],
    data: function () {
        return {
        }
    },
    components: {},
    methods: {

			setModel (m){
				this.model = m;
			},

			setJwtToken(t) {
				this.jwtToken = t
			},

      async downloadZip () {
        this.logger.log(-1, 'downloadZip', 'enter')

        try {
          let content = await ZipSevice.writeZipToBlob(this.model, this.jwtToken)
          console.debug(content)
          saveAs(content, this.model.name + '.zip')
        } catch (err) {
          this.logger.error('downloadZip', 'error', err)
          this.logger.sendError(err)
        }


        this.logger.log(-1, 'downloadZip', 'exit')
      },

    },

    mounted () {
			this.logger = new Logger("ExportZip");
    }
}
</script>