
<template>
    <div class="">
      <label>Export</label>
      <div class="MatcDesignTokenDialogListCntr " >
          <div v-for="t in filteredTokens" :key="t.id" class="MatcDesignTokenDialogListRow">

            <DesignTokenPreview :designtoken="t" />
          </div>

      </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import DesignTokenPreview from '../components/DesignTokenPreview'
//import CheckBox from 'common/CheckBox'

export default {
    name: 'DesignTokenDialog',
    mixins:[DojoWidget],
    data: function () {
        return {
          model: null,
          tokenType: '',
          cssProps: [],
          token: null
        }
    },
    components: {
      'DesignTokenPreview': DesignTokenPreview,
    },
    computed: {
      filteredTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          Object.values(this.model.designtokens).forEach(t => {
            if (t.type === this.tokenType) {
              result.push(t)
            }
          })
        }
        return result
      }
    },
    methods: {
      onCheckBox () {

      },
      getValue () {
        this.token
      },
      setTokenType (t) {
        this.tokenType = t
      },
      setDesignToken (t) {
        this.token = t
      },
      setModel (m) {
        this.model = m
      }
    },
    mounted () {
    }
}
</script>