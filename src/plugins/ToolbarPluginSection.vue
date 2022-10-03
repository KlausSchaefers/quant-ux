
<template>
    <div class="MatcToolbarSection">
    </div>
</template>

<script>


export default {
    name: 'PluginSection',
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