<template>
  <div>
    <div class="VommondContentContainer">


      <div class="MatcContent MatcMarginTopXXL">
        <div class="MatcSection MatcSectionOdd">
          <div class="container">
             <div class="row">
              <div class="col-md-12">
                  <Help />
              </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Service from 'services/Services'
import Help from 'help/Help'

export default {
  name: "404",
  mixins: [],
   data: function() {
    return {
        name: '',
        email: '',
        message: '',
        done: false
    }
  },
  components: {
      'Help': Help
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
