
<template>
  <div :class="['VommondFileButton',{'VommondFileButtonSelected' : this.file}]">
      <div class="VommondFileButtonLabel" ref="labelNode" v-if="!icon">
          {{getLabel()}}
      </div>
      <span v-else :class="[icon, 'VommondFileButtonIcon']"/>
      <input type="file" class="VommondFileButtonFile" ref="input" @change="onFileChange"/>
  </div>
</template>
<style>

</style>

<script>

export default {
  name: "FileButton",
  props: ['label', 'icon'],
  data: function () {
    return {
        file: null
    };
  },
  components: {},
  computed: {
      
  },
  methods: {
    getLabel () {
        if (this.file) {
            return this.file.name
        }
        return this.label
    },

    onFileChange () {
      if (this.$refs.input) {
        let files = this.$refs.input.files;
        if (files.length === 1) {
            this.file = files[0]
            this.$emit('change', this.file)
        }
      }
    }
  }
};
</script>