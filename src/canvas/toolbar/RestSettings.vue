
<template>
     <div class="MatcToolbarRestSettings">
        

         <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='endpoint'" :class="{'MatcToolbarTabActive': tab === 'endpoint'}">Endpoint</a>
            <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Input</a>
            <a @click="tab='output'" :class="{'MatcToolbarTabActive': tab === 'output'}">Output</a>
            <a @click="tab='preview'" :class="{'MatcToolbarTabActive': tab === 'preview'}">Test</a>
            <!-- <a @click="showPreview()" :class="{'MatcToolbarTabActive': tab === 'preview'}" v-if="hasPreview">Preview</a> -->
        </div>
        <div class="MatcMarginTop">
            <div v-show="tab === 'endpoint'">
                <p class="MatcHint">
                    Configure here the URL you want to load, the HTTP method and an auth token if needed.
                </p>
                
                <SegmentButton :options="methods" v-model="selectedMethod" style="width:300px"/>


            </div>
             <div v-show="tab === 'input'">
                {{
                    dataBindings
                }}
             </div>
              <div v-show="tab === 'output'">
                Output
             </div>
            <div v-show="tab === 'preview'">
                Preview
             </div>
        </div>
      
       
        <div>
            {{getValue()}}
        </div>
	</div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
// import CheckBox from 'common/CheckBox'
import SegmentButton from 'page/SegmentButton'

export default {
    name: 'RestSettings',
    mixins:[DojoWidget, Util],
    props:["app", "value"],
    data: function () {
        return {
            tab: "endpoint",
            checkBoxChecked: false,
            methods: [
                {
                    label: "GET",
                    value: "GET"
                },
                {
                    label: "POST",
                    value: "POST"
                },
                {
                    label: "PUT",
                    value: "PUT"
                },
                {
                    label: "DELETE",
                    value: "DELETE"
                }
            ],
            selectedMethod: "GET",
            model: {
                widgets: {}
            },
            widget: null,
            url: "",
            token: ""
        }
    },
    components: {
        SegmentButton: SegmentButton
        // CheckBox: CheckBox
    },
    computed: {
        dataBindings () {
            return  this.getAllAppVariables()
        }
    },
    methods: {
        setWidget (w) {
            this.widget = w
		},
		
		setModel  (m){
            this.model = m;
        },
        getValue () {
            return {
                "method": this.selectedMethod,
                "selected": this.checkBoxChecked
            }
        }
    }, 
    mounted () {
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>