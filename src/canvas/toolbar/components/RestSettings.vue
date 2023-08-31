
<template>
     <div class="MatcToolbarRestSettings">

      <label>Endpoint</label>
      <div class="MatcToolbarRestSettingsHeader">
            <DropDownButton :options="methods" v-model="rest.method" style="width:100px" @change="onChange"/>

            <input v-model="rest.url" class="form-control" @change="onChange" placeholder="https://server.com/${databinding}.json"/>

            <a @click="run" class="MatcButton">Test</a>
      </div>


      <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='output'" :class="{'MatcToolbarTabActive': tab === 'output'}">Response</a>
            <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Request</a>
            <a @click="tab='auth'" :class="{'MatcToolbarTabActive': tab === 'auth'}">Header</a>
            <a @click="tab='params'" :class="{'MatcToolbarTabActive': tab === 'params'}" style="margin-left:20px;">Test Parameter</a>
            <a @click="tab='preview'" :class="{'MatcToolbarTabActive': tab === 'preview'}">Test Result</a>
        </div>

        <div class="MatcMarginTop">
            <div v-show="tab === 'output'">

                <div class="form-group">
                    <label>Output Variable</label>
                    <Combo
                        :value="rest.output.databinding"
                        @change="onChangeOutputVar"
                        :hints="hints"
                        :fireOnBlur="true"
                        :formControl="true"
                        :isDropDown="true"
                        placeholder="Name of output variable"/>
                </div>

                <div class="form-group MatcToolbarRestOutputHeaderType"  >
                    <label>Output Type</label>
                    <SegmentButton :options="outputTypes" v-model="rest.output.type" style="width:300px" @change="onChange"/>
                </div>
            </div>

            <div v-show="tab === 'auth'">

                <div class="form-group">
                    <label>Auth Token</label>
                    <div class="MatcToolbarRestAuth">
                        <DropDownButton :options="authMethods" v-model="rest.authType"/>
                        <input v-model="rest.token" class="form-control" @change="onChange" placeholder="Enter auth token if needed"/>
                    </div>
                </div>

                <div :class="['MatcToolbarRestHeaderCntr', {'MatcToolbarRestHeaderCntrLong': rest.headers.length > 4} ]">
                    <div class="MatcToolbarRestHeaderRow" v-for="(header, i) in rest.headers" :key="i">

                          <Combo
                            :value="header.key"
                            @change="setHeaderKey(i, $event)"
                            :hints="variableHints"
                            magicChar="$"
                            :fireOnBlur="true"
                            :formControl="true"
                            placeholder="Key"/>

                        <Combo
                            :value="header.value"
                            @change="setHeaderValue(i, $event)"
                            :hints="variableHints"
                            magicChar="$"
                            :fireOnBlur="true"
                            :formControl="true"
                            placeholder="Value"/>
                
                        <span class="mdi mdi-close-circle" @click="removeHeader(i)" />
                    </div>
                </div>
                <span class="MatcButton" @click="addHeader">Add Header</span>

                <p class="MatcHint MatcMarginTop" v-if="rest.headers && rest.headers.length < 5">
                    You can use ${databinding} expressions in the headers
                </p>

            </div>

             <div v-show="tab === 'input'">

                    <div class="form-group" v-if="(rest.method == 'GET' || rest.method === 'DELETE')" >
                        <p class="MatcHint">
                            No need to specify inputs
                        </p>
                    </div>

                    <div class="form-group"  v-if="rest.method === 'POST' || rest.method === 'PUT'" >
                        <label>{{ rest.method }} Type</label>
                        <SegmentButton :options="inputTypes" v-model="rest.input.type" style="width:400px" @change="onChange"/>
                    </div>

                    <div class="form-group" v-if="(rest.method === 'POST' || rest.method === 'PUT') && rest.input.type === 'JSON' " >

                        <label>{{ rest.method }} JSON</label>
                        <Ace
                            ref="aceEditor"
                            v-model="rest.input.template"
                            @init="editorInit"
                            lang="json"
                            theme="chrome"
                            width="800"
                            height="180"></Ace>

                        <p class="MatcHint">
                            Use the ${databinding} notation to send data from the prototype.
                        </p>
                    </div>

                    <div class="form-group" v-if="(rest.method === 'POST' || rest.method === 'PUT') && rest.input.type === 'FORM' " >

                        <label>{{ rest.method }} FORM</label>
                        <Ace
                            ref="aceEditor"
                            v-model="rest.input.template"
                            @init="editorInit"
                            lang="text"
                            theme="chrome"
                            width="800"
                            height="180"></Ace>

                        <p class="MatcHint">
                            Insert a list of line separated key:value pairs. Use the ${databinding} notation to send data from the prototype.
                        </p>
                    </div>

             
                    <div class="form-group" v-if="(rest.method === 'POST' || rest.method === 'PUT') && rest.input.type === 'FILE' " >
                        <div class="form-group"  v-if="rest.method === 'POST' || rest.method === 'PUT'" >
                            <label>File DataBinding</label>
                            <Combo
                                :value="rest.input.fileDataBinding"
                                @change="onChangeFileDataBinging"
                                :hints="hints"
                                :fireOnBlur="true"
                                :formControl="true"
                                :isDropDown="true"
                                placeholder="Name of output variable"/>

                        </div>
                        <p class="MatcHint">
                            Image will be send as mutlipart
                        </p>
                    </div>

             </div>
            <div v-show="tab === 'params'">
                <div class="MatcMarginBottom" >
                        <div class="MatcToolbarRestDataBindingRow" v-for="(key) in dataBindingKeys" :key="key">
                            <span class="MatcToolbarRestDataBindingRowLabel">{{key}}</span>
                            <input
                                v-model="databingValues[key]"
                                class="form-control"
                                ref="dbInputs"
                                v-if="rest.input.type === 'JSON' || rest.input.type === 'FORM'" />

                            <FileButton
                                v-if="rest.input.type === 'JSON' || rest.input.type === 'FORM'"
                                class="MatcToolbarRestDataBindingIcon"
                                @change="onDataBingingFileChange(key, $event)"
                                icon="mdi mdi-cloud-upload"/>

                            <FileButton
                                v-if="rest.input.type === 'FILE'"
                                class="MatcToolbarRestDataBindingFile"
                                @change="onFileChange"
                                label="Select a file"/>

                        </div>
                        <span v-if="dataBindingKeys.length == 0 && rest.input.type === 'JSON'">
                            You are not using databings. No need to specify any data.
                        </span>
                    </div>

            </div>

            <div v-show="tab === 'preview'">

                <pre v-if="rest.output.type != 'IMAGE'"
                    :class="['MatcToolbarRestDataBindingCntr MatcMarginBottom', {'MatcError': testError}]">{{testResult}}</pre>
                <div class="MatcToolbarRestDataBindingCntr" v-else >
                    <img :src="testResultImage">
                </div>

             </div>
        </div>

        <div class="MatcError">
                {{testError}}
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
import Input from 'common/Input'
import FileButton from 'common/FileButton'

export default {
    name: 'RestSettings',
    mixins:[DojoWidget, Util],
    props:["app", "value"],
    data: function () {
        return {
            tab: "output",
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
                    label: "File",
                    value: "FILE"
                },
                {
                    label: "Form-Encoded",
                    value: "FORM"
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
                authType: 'Bearer',
                input: {
                    type: "JSON",
                    template: ''
                },
                output: {
                    databinding: '',
                    template: '',
                    type: 'JSON',
                    hints: {}
                },
                headers: []
            },
            databingValues: {},
            testResult: '',
            testError: '',
            runSuccess: false,
            isDirty: false,
            uploadedFile: null,
            authMethods: [
                {
                    "label": "Bearer",
                    "value": "Bearer",
                },
                {
                    "label": "Basic",
                    "value": "Basic",
                }
            ]
        }
    },
    components: {
        'SegmentButton': SegmentButton,
        'DropDownButton': DropDownButton,
        'Combo': Input,
        'FileButton': FileButton,
        'Ace': () => import(/* webpackChunkName: "ace" */ 'vue2-ace-editor')
    },
    computed: {
        dataBindingKeys () {
            let values = RestEngine.getNeededDataBings(this.rest)
            return values
        },
        testResultImage () {
            var base64Flag = 'data:image/jpeg;base64,';
            var imageStr = this.arrayBufferToBase64(this.testResult);
            return base64Flag + imageStr
        },
        variableHints () {
            let hints = this.getAllAppVariables()
            return hints.map(h => {
                let v = "${" + h + "}"
				return {
					label: v,
					value: v
				}
            })
        },
        hints () {
            let hints = this.getAllAppVariables()
            return hints.map(h => {
				return {
					label: h,
					value: h
				}
            })
        }
    },
    methods: {
        setHeaderKey (i, value) {
            this.logger.log(-1, 'setHeaderKey', 'enter' + i, value)
            if (this.rest.headers[i]) {
                this.rest.headers[i].key = value
            }
        },
        setHeaderValue (i, value) {
            this.logger.log(-1, 'setHeaderValue', 'enter' + i, value)
            if (this.rest.headers[i]) {
                this.rest.headers[i].value = value
            }
        },
        addHeader () {
            this.logger.log(-1, 'addHeader', 'enter')
            if (!this.rest.headers) {
                this.logger.log(-1, 'addHeader', 'Set headers')
                this.rest.headers = []
            }
            this.rest.headers.push({
                key: '',
                value: ''
            })
            console.debug(this.rest.headers)
        },
        removeHeader (i) {
            this.logger.log(-1, 'removeHeader', 'enter', i)
            if (!this.rest.headers) {
                this.logger.log(-1, 'removeHeader', 'Set headers')
                this.rest.headers = []
            }
            this.rest.headers.splice(i, 1);
        },
        onDataBingingFileChange (key, file) {
            this.$set(this.databingValues, key, file)
        },
        onFileChange (file) {
            this.uploadedFile = file
            this.databingValues = {}
            this.databingValues[this.rest.input.fileDataBinding] = file
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
                if (!this.rest.output.databinding) {
                    this.logger.log(-1, 'setWidget', 'Set name as output')
                    this.rest.output.databinding = this.widget.name
                }
                if (!this.rest.authType) {
                    this.logger.log(-1, 'setWidget', 'Set auth')
                    this.rest.authType = 'Bearer'
                }

                if (!this.rest.headers) {
                    this.logger.log(-1, 'setWidget', 'Set headers')
                    this.$set(this.rest, "headers", [])
                }
            }
		},

		setModel  (m){
            this.model = m;
        },
        getValue () {
            return this.rest
        },
        onChangeFileDataBinging (value) {
            this.$set(this.rest.input, 'fileDataBinding', value)
            this.onChange()
        },
        onChangeOutputVar (value) {
            this.rest.output.databinding = value
            this.onChange()
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
                // this.testResult ='The output databinding is empty'
                this.testError = `The output data binding is empty`
                this.tab = 'output'
                return false
            }


            let values = this.getAllAppVariables()
            values.forEach(key => {
                url = this.replaceAll(url, key, '"v:' + key + '"')
                template = this.replaceAll(template, key, '"v:' + key + '"')
            })

            let matches = url.match(/\$\{(\w*)\}/g)
            if (matches){
                // this.testResult = url
                // this.testError = `The url contains variables '${matches}' without data binding`
                // this.tab = 'endpoint'
                // return false;
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

        replaceAll (s, key, value) {
            let pattern = "${" + key + "}"
            let i = 0
            while (s.indexOf(pattern) >= 0 && i < 100) {
                s = s.replace(pattern, value)
                i++
            }
            return s
        },

        buildHints (object) {
            this.rest.output.hints = {}
            let prefix = this.rest.output.databinding
            this.visitResult(object, this.rest.output.hints, prefix)

            this.onChange()
        },
        visitResult (object, result, prefix) {
            try {
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
            } catch (e) {
                console.error(e)
                console.error(e.stack)
            }
        },
        async run () {
            console.debug('run')
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
        },
        editorInit  () {
            require(/* webpackChunkName: "ace" */ 'brace/ext/language_tools') //language extension prerequsite...
            require(/* webpackChunkName: "ace" */ 'brace/mode/json')
            require(/* webpackChunkName: "ace" */ 'brace/theme/chrome')

            let editor = this.$refs.aceEditor.editor
            editor.setOptions({
                enableBasicAutocompletion: false,
                enableSnippets: false,
                enableLiveAutocompletion: true
            });

            let vars = this.getAllAppVariables()
            editor.completers.push({
                getCompletions (editor, session, pos, prefix, callback) {
                    if (prefix.indexOf('$') === 0) {
                        let result = vars.map(v => {
                            return {name: v, value: '${' + v + '}', score: 1, meta: "databinding"}
                        })
                        callback(null, result)
                    }
                }
            });
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