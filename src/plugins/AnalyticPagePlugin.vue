
<template>
    <section class="section" v-if="false">
      <div class="container">
        <div class="box is-shadowless">
          <h2 class="title">Integrations</h2>
         
        </div>
      </div>
    </section>
</template>

<script>


export default {
    name: 'AnalyticPagePlugin',
    props:["user", "model", "events"],
    mixins:[],
    data: function () {
        return {
			value: null
        }
    },
    components: {
	},
    methods: {
    },
    mounted () {
    }
}
</script>