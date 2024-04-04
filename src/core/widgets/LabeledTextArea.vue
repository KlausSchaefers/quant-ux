<template>
    <div class="MatcWidgetTypeLabeledTextBox ">
        <div ref="labelNode" class="MatcWidgetTypeLabeledTextBoxLabel">{{ label }}</div>
        <div ref="inputNode" class="MatcWidgetTypeLabeledTextBoxInputCntr MatcWidgetTypeTextBox MatcWidgetTypeTextArea"></div>
    </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import topic from "dojo/topic";
import Logger from "common/Logger";
import touch from "dojo/touch";
import TextBox from "core/widgets/TextBox";

export default {
    name: "LabeledTextBox",
    mixins: [TextBox, DojoWidget],
    data: function () {
        return {
            label: '',
            value: null,
            mode: "edit",
            hasFocus: false
        };
    },
    components: {},
    computed: {
    },
    methods: {
        postCreate() {

            this.log = new Logger("LabeledTextBox");

            if (this.mode == "simulator") {
                this.input = document.createElement("textarea");        
                css.add(this.input, "MatcWidgetTypeTextBoxInput");
            } else {
                this.input = document.createElement("div");
                css.add(this.input, "MatcWidgetTypeTextAreaPreview");
            }

            this.labelNode = this.$refs.labelNode
            this.inputNode = this.$refs.inputNode
            this.inputNode.appendChild(this.input);

            this._borderNodes = [this.input];
            this._backgroundNodes = [this.input];
            this._paddingNodes = [this.input];
            this._shadowNodes = [this.input];
            this._labelNodes = [this.input];

        },

        getAnimationNode() {
            return this.inputNode;
        },

        wireEvents() {
            if (!this.wired) {
                this.own(this.addClickListener(this.inputNode, lang.hitch(this, "onInputClick")));
                this.own(on(this.input, "focus", lang.hitch(this, "onFocus")));
                if (this.mode == "simulator") {
                    this.own(on(this.input, "blur", lang.hitch(this, "onBlur")));
                    this.own(on(this.input, "change", lang.hitch(this, "onChange")));
                    this.own(topic.subscribe("MatcSimulatorEvent", lang.hitch(this, "onSimulatorEvent")));
                }
            }
            this.afterWiredEvents();
            this.wired = true;
            this.setAutoFocus(this.input);
            this.wireHover()
        },


        wireHover (over = touch.over, out = touch.out) {
            this.own(on(this.inputNode, over, lang.hitch(this, "onDomMouseOver")));
            this.own(on(this.inputNode, out, lang.hitch(this, "onDomMouseOut")));
        },

        resize (pos) {
            this.setInputSize(this.style, pos)
            this.setLabelPadding(this.style, this.model)
        },

        getLabelNode () {
            return this.labelNode;
        },
            
        initLabel(model) {
            if (model.props.label) {
                this.label = model.props.label
            }
            if (model.props.placeholderLabel) {
                this.setPlaceholder(model.props.placeholderLabel);
            }
        },

        onTextBoxRendered(model) {
            this.setInputSize(this.style, model)
            this.setLabelPadding(this.style, model)
        },

        setLabelPadding(style, model) {
            if (model.props.labelPadding) {
                const l = style.paddingLeft + style.borderLeftWidth
                this.labelNode.style.paddingLeft = l + 'px'

                const r = style.paddingRight + style.borderRightWidth
                this.labelNode.style.paddingRight = r + 'px'
            }
        },

        setInputSize(style, box) {
            //console.debug(style.fontSize, style.paddingBottom, style.paddingTop, style.borderBottomWidth, style.borderTopWidth, this._scaleY)
            if (style.inputHeight && style.inputHeight > 0) {
                const h = this.getZoomed(style.inputHeight , this._scaleY);
                this.inputNode.style.height = h + 'px'
            } else {
                let h = style.fontSize +
                    style.paddingBottom +
                    style.paddingTop +
                    style.borderTopWidth +
                    style.borderBottomWidth
                
                h = box.h - h

                h = this.getZoomed(h , this._scaleY);
                this.inputNode.style.height = h + 'px'
            }


        },

        _set_labelOffset(parent, style) {
            const o = this.getZoomed(style.labelOffset , this._scaleY); 
            this.labelNode.style.paddingLeft = o + 'px'
            this.labelNode.style.paddingRight = o + 'px'
        },

        _set_labelColor(parent, style) {
            this.labelNode.style.color = style.labelColor
        },

        _set_labelFontSize(parent, style) {      
            if (style.labelFontSize === -1) {
                const size = this.getZoomed(style.fontSize * 0.75 , this._scaleY);
                this.labelNode.style.fontSize = size + 'px'
            } else {
                const size = this.getZoomed(style.labelFontSize , this._scaleY);
                this.labelNode.style.fontSize = size + 'px'
            }
        },

        _set_labelFontWeight(parent, style) {
            this.labelNode.style.fontSize = style.labelFontWeight + 'px'
        },

        /**
         * Child classes can do something in here
         */
        beforeSetStyle() { },
    },
    mounted() { }
};
</script>