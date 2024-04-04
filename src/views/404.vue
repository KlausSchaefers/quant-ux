<template>
  <div>
    <div class="VommondContentContainer">
      <div class="MatcHeader MactMainGradient MatcHeaderTab bs-docs-header">
        <div class="container">
          <div class="row MatcHeaderTopRow">
            <div class="col-md-12">
                Ooopss... Something went wrong!
            </div>
          </div>

          <div class="row MatcHeaderBottomRow">
            <div class="col-md-12 MatcRight"></div>
          </div>
        </div>
      </div>

      <div class="MatcContent MatcAbout">
        <div class="MatcSection MatcSectionOdd">
          <div class="container">
             <div class="row">
              <div class="col-md-6">
                Something went wrong
              </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../style/components/menu.scss';
</style>

<script>
import Service from 'services/Services'
export default {
  name: "Page404",
  mixins: [],
   data: function() {
    return {   
        name: '',
        email: '',
        message: '',
        done: false
    }
  },
  methods: {
      async send () {
          let res = await Service.getUserService().contact(this.name, this.email, this.message)
          if (res) {
            this.done = true
          }
      }
  },
  mounted() {}
};
</script>
