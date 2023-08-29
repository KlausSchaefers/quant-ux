
<template>


            <div :class="'MatcScatterPlotDetails ' + value.cls" :style="'bottom: ' + value.y +'%; left:' + value.x +'%'">
                <span class="MatcScatterPlotDetailsArrow"></span>
                <div class="MatcScatterPlotDetailsContainer">
                    <table>
                        <tr>
                            <td>
                                {{getNLS("analytics.distribution.details.duration")}}:
                            </td>
                            <td>
                                {{Math.round(value.s.duration / 1000)}} s
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{getNLS("analytics.distribution.details.interactions")}}:
                            </td>
                            <td>
                                {{value.s.interactions}}
                            </td>
                        </tr>
                        <!-- <tr>
                            <td>
                                {{getNLS("analytics.distribution.details.errors")}}:
                            </td>
                            <td>
                                {{value.s.errors}}
                            </td>
                        </tr> -->
                     
                        <tr>
                            <td>
                                {{getNLS("analytics.distribution.details.screens")}} :
                            </td>
                            <td>
                                {{value.s.screenUnique}} / {{value.s.screenLoads}}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{getNLS("analytics.distribution.details.weirdness")}} :
                            </td>
                            <td>
                                {{Math.round(value.s.weirdness * 100)}}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                {{getNLS("analytics.distribution.details.tasks")}}:
                            </td>
                            <td>
                                <div class="MatcScatterPlotDetailsTaskCntr">
                                    <span v-for="t in value.tasks" :key="t" class="MatcScatterPlotDetailsTask">
                                        {{t}}
                                    </span>
                                </div>
                            </td>
                        </tr>
                       
                    </table>

                
                </div>
            </div>
</template>

<style lang="scss">
    @import '../../../style/components/scatter.scss';
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
export default {
    name: 'ScatterPlotDetails',
    mixins: [DojoWidget],
    props: ['value'],
    data: function () {
        return {
        }
    },
    components: {

    },
    methods: {
    },
    watch: {
    },
    mounted() {        
    }
}
</script>