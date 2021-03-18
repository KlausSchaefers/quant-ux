
<template>
    <div class="">

      <div class="MatcDesignTokenDialogCntr " >
        <div class="MatcDesignTokenDialogList" >

          <a v-for="t in filteredTokens" :key="t.id" :class="{'selected': token && t.id === token.id}" @click="onSelect(t)">
             {{t.name}}
          </a>

        </div>

        <div class="MatcDesignTokenDialogEdit " >


        </div>

      </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
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

    },
    computed: {
      filteredTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          Object.values(this.model.designtokens).forEach(t => {
              result.push(t)
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

      onSelect (t) {
        this.setDesignToken(t)
      },
      setTokenType (t) {
        this.tokenType = t
      },
      setDesignToken (t) {
        this.token = lang.clone(t)
      },
      setModel (m) {
        this.model = m
      }
    },
    mounted () {
    }
}
</script>