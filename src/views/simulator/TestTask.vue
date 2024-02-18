
<template>  
        <div :class="['MatcTestTask', {'MatcTestTaskDone':done }, {'MatcTestTaskCollapased': collapsed}]">
            <div class="MatcTestTaskHeader">
                <h4>
                    <QIcon icon="ChevronDown" class="MatcChevron" @click="collapsed = !collapsed"/> 
                    {{task.name}} 
                </h4>
                <div v-if="done" class="MatcTestTaskDoneMarker">
                    <QIcon icon="CheckBoxRound" />                 
                </div>
            </div>        
            <p class="MatcTestTaskDescription MatcScrollContainer" ref="descriptionBox" v-if="!collapsed">
                {{task.description}}
            </p>
        </div>
    </template>
    
    <script>
    import QIcon from 'page/QIcon'
        
    export default {
        name: 'TestTask',
        mixins:[],
        props:['task', 'done'],
        data: function () {
            return {
                'collapsed': false
            }
        },
        computed: {
        },
        components: {
            'QIcon': QIcon
        },
        watch: {
            done (v) {
                if (v) {
                    this.collapsed = true
                }
            }
        },
        mounted () {
        }
    }
    </script>
    