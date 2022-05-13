
<template>
    <div class=" MatcToolbarSection">
        <div class=" MatcToolbarSectionLabel">{{title}}</div>
            <div class="  MatcToolbarSectionContent">
                <slot/>
            </div>
    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'

export default {
    name: 'PropertySection',
    props:["title"],
    mixins:[Util, DojoWidget],
    data: function () {
        return {
			
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