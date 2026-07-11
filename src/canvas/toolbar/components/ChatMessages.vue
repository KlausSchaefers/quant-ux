
<template>
    <div class="MatcChatMessageEditor MatcDialogTable MatcDialogTableScrollable">

        <table class="MatcToolbarTableSettingsTable">
            <thead>
                <tr class="MatcFormRow">   
                    <th>Message</th>
                    <th style="width:70px;">User</th>
                    <th style="width:50px"></th>
                </tr>
            </thead>
            <tbody>

                <tr :class="['MatcFormRow', { 'MatcFormRowDNDHover': i === hoverRow }, { 'MatcFormRowDNDSelect': i == dragRow }]"
                    v-for="(message, i) in messages" :key="i" :draggable="isDraggable"
                    @dragstart="onDragStart($event, i)" @dragover="onDragOver($event, i)"
                    @dragleave="onDragLeave($event, i)" @drop="onDrop($event, i)">

                    <td>
                        <div class="MatcFormRowDND">
                            <QIcon icon="HandleDND" @mouseover="isDraggable = true" @mouseout="isDraggable = false" />
                            <textarea class="MatcChatMessageInput MatcIgnoreOnKeyPress form-control"
                                :value="message.content"
                                :placeholder="placeholder"
                                @input="onInput(message, $event)"
                                @change="onChange" />
                        </div>
                    </td>
                    <td>
                        <CheckBox :value="message.role === 'user'" label=""
                            @change="setRole(message, $event)" />
                    </td>
                    <td class="MatcFormRowRemove">
                        <QIcon icon="DeleteX" @click="removeMessage(i)" />
                    </td>
                </tr>

                <tr class="MatcFormRow">

                    <td colspan="2">
                        <span class="MatcButton MatcButtonXS" @click="addMessage">Add Message</span>
                    </td>
                    <td></td>
                </tr>

            </tbody>
        </table>

    </div>
</template>

<style lang="scss">
    @import "../../../style/toolbar/chat_message.scss";
    	@import '../../../style/components/toolbar_table.scss';
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import lang from 'dojo/_base/lang'
import CheckBox from 'common/CheckBox'
import QIcon from 'page/QIcon'

export default {
    name: 'ChatMessage',
    mixins: [DojoWidget],
    props: {
        value: {
            type: Array,
            default: () => []
        },
        placeholder: {
            type: String,
            default: 'Type a message'
        }
    },
    data: function () {
        return {
            messages: [],
            dragRow: -1,
            hoverRow: -1,
            isDraggable: false
        }
    },
    components: {
        'CheckBox': CheckBox,
        'QIcon': QIcon
    },
    methods: {
        setValue (value) {
            this.messages = lang.clone(value || [])
        },
        setRole (message, isUser) {
            message.role = isUser ? 'user' : 'assistant'
            this.onChange()
        },
        onInput (message, e) {
            message.content = e.target.value
            this.onChange()
        },
        addMessage () {
            const role = this.messages.length > 0
                ? (this.messages[this.messages.length - 1].role === 'user' ? 'assistant' : 'user')
                : 'assistant'
            this.messages.push({
                type: 'message',
                role: role,
                content: ''
            })
            this.onChange()
        },
        removeMessage (i) {
            this.$delete(this.messages, i)
            this.onChange()
        },
        onDragStart (e, i) {
            e.dataTransfer.setData("text", i);
            e.dataTransfer.effectAllowed = 'move';
            this.dragRow = i
        },
        onDragOver (e, i) {
            e.preventDefault();
            this.hoverRow = i
        },
        onDragLeave () {
            this.hoverRow = -1
        },
        onDrop (e, i) {
            e.preventDefault();
            const data = e.dataTransfer.getData("text");
            const j = data * 1
            if (this.messages[i] && this.messages[j]) {
                const temp = this.messages[i]
                this.messages[i] = this.messages[j]
                this.messages[j] = temp
                this.$forceUpdate()
                this.onChange()
            }
            this.dragRow = -1
            this.hoverRow = -1
        },
        onChange () {
            this.logger.log(1, 'onChange', 'messages', this.messages.length)
            this.$emit('change', this.messages)
        }
    },
    watch: {
        value (v) {
            this.setValue(v)
        }
    },
    mounted () {
        this.logger = new Logger('ChatMessage')
        this.setValue(this.value)
    }
}
</script>
