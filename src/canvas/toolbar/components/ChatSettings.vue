
<template>
    <div class="">

        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab = 'messages'" :class="{ 'MatcToolbarTabActive': tab === 'messages' }">Messages</a>
             <a @click="tab = 'responses'" :class="{ 'MatcToolbarTabActive': tab === 'responses' }">Responses</a>
            <a @click="tab = 'ai'" :class="{ 'MatcToolbarTabActive': tab === 'ai' }">AI</a>
        </div>

        <div class="">

            <div v-if="tab === 'messages'" class="">
                <ChatMessages :value="messages" @change="onChangeMessages" class="MatcMarginTop" />
            </div>


            <div v-if="tab === 'responses'" class="">
                <ChatMessages :value="responses" @change="onChangeResponses" class="MatcMarginTop" />
            </div>



            <div v-if="tab === 'ai'" class=" ">
                <div class="MatcCardInfo MatcCard MatcCardSmall ">
                    <h3>Comming soon...</h3> 
                    Soon you can connect here to your agents or build a simple one your self.
                </div>



            </div> <!-- End Actions -->


        </div>

    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import lang from 'dojo/_base/lang'
import ChatMessages from './ChatMessages'
// import ToolbarColor from './ToolbarColor'
// import CheckBox from 'common/CheckBox'
// import DataTable from './DataTable'
// import QIcon from 'page/QIcon'

export default {
    name: 'ChatSettings',
    mixins: [DojoWidget],
    props: ["app", "value"],
    data: function () {
        return {
            dragRow: -1,
            hoverRow: -1,
            isDraggable: false,
            tab: 'messages',
            widget: '',
            model: '',
            settings: {},
            style: {},
            messages: [],
            responses: [],
            props: {
                tableActions: [],
                columns: [],
                data: []
            }
        }
    },
    components: {
        'ChatMessages': ChatMessages
    },
    computed: {

    },
    methods: {
      
        setWidget(w) {
            this.widget = w
            this.messages = lang.clone(w && w.props && w.props.value ? w.props.value : [])
            this.responses = lang.clone(w && w.props && w.props.responses ? w.props.responses : [])
        },

        setModel(m) {
            this.model = m;
        },

        onChangeMessages(messages) {
            this.messages = messages
        },

        onChangeResponses(responses) {
            this.responses = responses
        },

        getValue() {
            return {
                'value': this.messages,
                'responses': this.responses
            }
        }

    },
    watch: {
        value(v) {
            this.setWidget(v)
        }
    },
    mounted() {
        this.logger = new Logger("ChatSettings")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>