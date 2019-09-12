
<template>
     <div class="MatcToolbarRestSettings">
   
      <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='endpoint'" :class="{'MatcToolbarTabActive': tab === 'endpoint'}">Endpoint</a>
            <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Input</a>
            <a @click="tab='output'" :class="{'MatcToolbarTabActive': tab === 'output'}">Output</a>
            <a @click="tab='preview'" :class="{'MatcToolbarTabActive': tab === 'preview'}">Test</a>
        </div>
     
        <div class="MatcMarginTop">
            <div v-show="tab === 'endpoint'">
               
                <div class="form-group">
                    <label>URL</label>
                    <input v-model="rest.url" class="form-control" @change="onChange" placeholder="https://server.com/${databinding}.json"/>
                </div>

                <div class="form-group">
                    <label>Method</label>
                    <SegmentButton :options="methods" v-model="rest.method" style="width:300px" @change="onChange"/>
                </div>

                <div class="form-group">
                    <label>Auth Token</label>
                    <input v-model="rest.token" class="form-control" @change="onChange" placeholder="Enter auth token if needed"/>
                </div>

                <div class="MatcError">
                    {{testError}}
                </div>
            </div>
             <div v-show="tab === 'input'">

                    <div class="form-group" v-if="(rest.method == 'GET' || rest.method === 'DELETE')" >
                        <p class="MatcHint">
                            No need to specify inputs
                        </p>
                    </div>

                    <div class="form-group"  v-if="rest.method === 'POST' || rest.method === 'PUT'" >
                        <label>{{ rest.method }} Type</label>
                        <SegmentButton :options="inputTypes" v-model="rest.input.type" style="width:300px" @change="onChange"/>
                    </div>

                    <div class="form-group" v-if="(rest.method === 'POST' || rest.method === 'PUT') && rest.input.type === 'JSON' " >
                       
                        <label>{{ rest.method }} JSON</label>
                        <textarea 
                            class="form-control MatcToolbarRestSettingsInputArea" 
                            spellcheck="false" 
                            placeholder="{a: ${databinding}}"
                            v-model="rest.input.template" 
                            @change="onChange">
                        </textarea>

                        <p class="MatcHint">
                            Specify the JSON that will be send to the server. Use the <b>${databing}</b> notation to 
                            send data from the prototype.
                        </p>
                    </div>

                    <div class="form-group" v-if="(rest.method === 'POST' || rest.method === 'PUT') && rest.input.type === 'FORM' " >
                        <p class="MatcHint">
                            Form data will send all databings collected so far.
                        </p>
                    </div>

                    <div class="form-group" v-if="(rest.method === 'POST' || rest.method === 'PUT') && rest.input.type === 'IMAGE' " >
                        <p class="MatcHint">
                            Image will be send as mutlipart
                        </p>
                    </div>

             </div>
              <div v-show="tab === 'output'">
                <div class="form-group"  >
                    <label>Output DataBinging</label>
                    <input v-model="rest.output.databinding" @change="onChange" class="form-control"/>
                </div>
            
                <div class="form-group"  >
                    <label>Output Type</label>
                    <SegmentButton :options="outputTypes" v-model="rest.output.type" style="width:300px" @change="onChange"/>
                </div>

                <div class="MatcError">
                    {{testError}}
                </div>
             </div>
            <div v-show="tab === 'preview'">
                <div v-if="!testResult">
                    <div class="MatcToolbarRestDataBindingCntr MatcMarginBottom MatcToolbarRestSettingsInputArea" >
                        <div class="MatcToolbarRestDataBindingRow" v-for="(key) in dataBindingKeys" :key="key">  
                            <span>{{key}}</span>
                            <input v-model="databingValues[key]" />
                        </div>
                        <span v-if="dataBindingKeys.length == 0">
                            You are not using databings. No need to specify any data.
                        </span>
                    </div>
                    <div class="MatcError">
                        {{testError}}
                    </div>
                    <a @click="run" class="MatcButton">Run</a>
                </div>
                <div v-if="testResult">
                 
                    <pre :class="['MatcToolbarRestDataBindingCntr MatcMarginBottom', {'MatcError': testError}]">{{testResult}}</pre>
               
                    <div class="MatcError">
                        {{testError}}
                    </div>
                    <a @click="testResult = ''; testError= ''" class="MatcButton">Run Again</a>
                </div>

                
             </div>
        </div>

	</div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import lang from 'dojo/_base/lang'
import RestEngine from 'core/RestEngine'
import Logger from 'common/Logger'
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
            inputTypes: [
                {
                    label: "JSON",
                    value: "JSON"
                },
                {
                    label: "Image",
                    value: "Image"
                }
            ],
            outputTypes: [
                {
                    label: "JSON",
                    value: "JSON"
                },
                {
                    label: "String",
                    value: "TEXT"
                },
                {
                    label: "Image",
                    value: "Image"
                }
            ],
            model: {
                widgets: {}
            },
            widget: null,
            rest: {
                method: "GET",
                url: "",
                token: "",
                input: {
                    type: "JSON",
                    template: ''
                },
                output: {
                    databinding: '',
                    template: '',
                    type: 'JSON',
                    hints: {}
                }
            },
            databingValues: {},
            testResult: '',
            testError: '',
            runSuccess: false,
            isDirty: false
        }
    },
    components: {
        SegmentButton: SegmentButton
        // CheckBox: CheckBox
    },
    computed: {
        dataBindingKeys () {
            let values =  this.getAllAppVariables()
            return values.filter(v => {
                if (this.rest.url.indexOf(v) >= 0) {
                    return true;
                }
                if (this.rest.input.template.indexOf(v) >= 0) {
                    return true;
                }
                return false;
            })
        }
    },
    methods: {
        setWidget (w) {
            this.widget = w
            if (w.props && w.props.rest) {
                this.rest = lang.clone(w.props.rest)
            }
		},
		
		setModel  (m){
            this.model = m;
        },
        getValue () {
            return this.rest
        },
        onChange () {
            this.isDirty = true
            this.$emit('change', this.getValue())
        },
        hasRun () {
            console.debug("hasRun", this.isDirty, this.runSuccess)
            if (this.isDirty) {
                if (!this.runSuccess) {
                    this.testError = 'Please test before saving!'
                }
                return this.runSuccess
            }
            return true
        },
        validate () {
            let url = this.rest.url;
            let template = this.rest.input.template;
            let prefix = this.rest.output.databinding
            if (!prefix) {
                this.testResult ='The databinding is empty'
                this.testError = `The databinding is empty`
                this.tab = 'output'
                return false
            }

             if (prefix.indexOf('.') >= 0) {
                this.testResult ='The databinding must not contain dots (.)'
                this.testError = `The databinding must not contain dots (.)`
                this.tab = 'output'
                return false
            }

            let values = this.getAllAppVariables()
            values.forEach(key => {
                url = url.replace("${" + key + "}", '')
                template = template.replace("${" + key + "}", '')
            })

            let matches = url.match(/\$\{(\w*)\}/g)
            if (matches){
                this.testResult = url
                this.testError = `The url contains variables '${matches}' without data binding`
                this.tab = 'endpoint'
                return false;
            }
            matches = template.match(/\$\{(\w*)\}/g)
            if (this.rest.method === 'POST' && matches){
                this.testResult = template
                this.testError = `The input data contains variables '${matches}' without data binding`
                this.tab = 'output'
                return false;
            }
            return true;
        },
        buildHints (object) {
            this.rest.output.hints = {}
            let prefix = this.rest.output.databinding
            this.visitResult(object, this.rest.output.hints, prefix)

            this.onChange()
        },
        visitResult (object, result, prefix) {
            if (prefix.length > 300) {
                return
            }
            if (lang.isArray(object)) {
                let path = prefix + '[]'
                result[path] = "Array"
                object.forEach(o => {
                    this.visitResult(o, result, path)
                })
                return
            } 
            if (lang.isObject(object)) {
                for (let key in object) {
                    let o = object[key]
                    let path = prefix + '_' + key
                    result[path] = "Object"                   
                    this.visitResult(o, result, path)
                }
                return
            }
        },
        async run () {
            this.testResult = ''
            this.testError = ''
            if (!this.validate()) {
              
                return;
            }
            try {
                this.testResult = await RestEngine.run(this.rest, this.databingValues)
                if (this.rest.output.type === 'JSON') {
                    this.buildHints(this.testResult)
                    try {
                        // make it pretty for the reader
                        this.testResult = JSON.stringify(this.testResult, null, 2)
                    } catch (e) {
                        this.runSuccess = false
                        this.testError = 'The result is not json'
                    }
                }
            } catch (e) {
                this.runSuccess = false
                console.debug(e.stack)
                this.testResult = 'Error: ' + e.message
                this.testError = 'Something went wrong. Is the url ok? Are all databings set? Is the out type correct? '
            }
        }
    }, 
    mounted () {
        this.logger = new Logger("RestSettings")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>