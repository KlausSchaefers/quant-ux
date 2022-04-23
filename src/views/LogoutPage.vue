<template>
  <div>
    <div class="VommondContentContainer">
      

      <div class="MatcContent MatcAbout">
        <div class="MatcSection MatcSectionOdd">
          <div class="container">
             <div class="row">
              <div class="col-md-6">
                    For login has expired. Please login again.
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
export default {
  name: "LogoutPage",
  mixins: [],
   data: function() {
    return {   
    }
  },
  methods: {
  },
  mounted() {
      setTimeout(() => {
            Service.getUserService().logout()
            location.href= '/'
      }, 3000)

  }
};
</script>
