
<template>
     <div class="MatcToolbarRestSettings">

      <div class="MatcToolbarRestSettingsHeader">
            <DropDownButton :options="methods" v-model="rest.method" style="width:50px" @change="onChange"/>
              
            <input v-model="rest.url" class="form-control" @change="onChange" placeholder="https://server.com/${databinding}.json"/>
           
            <a @click="run" class="MatcButton">Test</a>
      </div>
   
      <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='auth'" :class="{'MatcToolbarTabActive': tab === 'auth'}">Authorization</a>
            <a @click="tab='output'" :class="{'MatcToolbarTabActive': tab === 'output'}">Response</a>
            <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Body</a>
            <a @click="tab='params'" :class="{'MatcToolbarTabActive': tab === 'params'}" style="margin-left:10px;">Test Parameter</a>
            <a @click="tab='preview'" :class="{'MatcToolbarTabActive': tab === 'preview'}">Test Result</a>
        </div>
     
        <div class="MatcMarginTop">
            <div v-show="tab === 'auth'">
            
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
                        <div class="form-group"  v-if="rest.method === 'POST' || rest.method === 'PUT'" >
                            <label>Input DataBinding</label>
                            <input v-model="rest.input.fileDataBinding" class="form-control" @change="onChange" placeholder=""/>
                        </div>
                        <p class="MatcHint">
                            Image will be send as mutlipart
                        </p>
                    </div>

                     <div class="MatcError">
                        {{testError}}
                    </div>

             </div>
              <div v-show="tab === 'output'">
               
                <div class="form-group"  >
                    <label>Output Type</label>
                    <SegmentButton :options="outputTypes" v-model="rest.output.type" style="width:300px" @change="onChange"/>
                </div>

                 <div class="form-group"  >
                    <label>Output DataBinding</label>
                    <input v-model="rest.output.databinding" @change="onChange" class="form-control"/>
                </div>

                <div class="MatcError">
                    {{testError}}
                </div>
             </div>
            <div v-show="tab === 'params'">
                <div class="MatcMarginBottom" >
                        <div class="MatcToolbarRestDataBindingRow" v-for="(key) in dataBindingKeys" :key="key">  
                            <span>{{key}}</span>
                            <input v-model="databingValues[key]" ref="dbInputs" v-if="rest.input.type === 'JSON'" />
                            <input
                                v-if="rest.input.type === 'IMAGE'" 
                                class="MatcToolbarRestDataBindingFile"
                                type="file" 
                                ref="fileUpload" 
                                accept="image/*" 
                                capture="user" 
                                @change="onFileChange"
                                />
                        </div>
                        <span v-if="dataBindingKeys.length == 0 && rest.input.type === 'JSON'">
                            You are not using databings. No need to specify any data.
                        </span>
                    </div>
                    <div class="MatcError">
                        {{testError}}
                    </div>
            </div>
             
            <div v-show="tab === 'preview'">
                    
                <pre v-if="rest.output.type != 'IMAGE'"  
                    :class="['MatcToolbarRestDataBindingCntr MatcMarginBottom', {'MatcError': testError}]">{{testResult}}</pre>
                <div class="MatcToolbarRestDataBindingCntr" v-else >
                    <img :src="testResultImage">
                </div>
                
                <div class="MatcError">
                    {{testError}}
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
import DropDownButton from 'page/DropDownButton'

export default {
    name: 'RestSettings',
    mixins:[DojoWidget, Util],
    props:["app", "value"],
    data: function () {
        return {
            tab: "auth",
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
                    value: "IMAGE"
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
                    value: "IMAGE"
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
            isDirty: false,
            uploadedFile: null
        }
    },
    components: {
        'SegmentButton': SegmentButton,
        'DropDownButton': DropDownButton
    },
    computed: {
        dataBindingKeys () {
            let values =  RestEngine.getNeededDataBings(this.rest)
            return values
        },
        testResultImage () {
            var base64Flag = 'data:image/jpeg;base64,';
            var imageStr = this.arrayBufferToBase64(this.testResult);
            return base64Flag + imageStr
        }
    },
    methods: {
        onFileChange () {
            if (this.$refs.fileUpload) {
                let files = this.$refs.fileUpload[0].files;
                if (files.length === 1) {
                    this.uploadedFile = files[0]
                    this.databingValues = {}
                    this.databingValues[this.rest.input.fileDataBinding] = files[0]
                }
            }
        },
        arrayBufferToBase64 (buffer) {
            var binary = '';
            var bytes = [].slice.call(new Uint8Array(buffer));      
            bytes.forEach((b) => binary += String.fromCharCode(b));
            return window.btoa(binary);
        },
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
            this.$nextTick( () => {
                this.isDirty = true
                this.$emit('change', this.getValue())
            })
        },
        hasRun () {
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
                this.tab = 'input'
                return false;
            }

            if (this.$refs.dbInputs) {
                let oneIsEmpty = false
                this.$refs.dbInputs.forEach(i => {
                    if (!i.value) {
                        oneIsEmpty = true
                    }
                })
                if (oneIsEmpty) {
                    this.testError = `Please provide some input data`
                    this.tab = 'params'
                    return false
                }
            }

            if (this.rest.input.type === 'IMAGE') {
                console.debug('this.rest.input.fileDataBinding', this.rest.input.fileDataBinding)
                if (!this.rest.input.fileDataBinding) {
                    this.testError = `Please  provide a input data binding`
                    this.tab = 'input'
                    return false
                }
                 if (!this.uploadedFile) {
                    this.testError = `Please select a file`
                    this.tab = 'params'
                    return false
                }
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
            if (Array.isArray(object)) {
                let path = prefix + '[0]'
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
            this.tab = 'preview'
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
                this.testResult = 'Error: ' + e.message
                this.testError = 'Something went wrong. Is the url ok? Are all databings set? Is the out type correct? '
            }
        }
    },
    watch: {
        value (v) {
            this.setWidget(v)
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