
<template>
    <div class="MatcWidgetTypeImagePaging">

    </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from "common/DomBuilder";

export default {
    name: "ImagePaging",
    mixins: [UIWidget, DojoWidget],
    data() {
        return {
            value: 1,
            max: 5,
            model: null
        };
    },
    components: {},
    computed: {
    },
    methods: {
        postCreate() {
            this._borderNodes = [];
            this._backgroundNodes = [];
            this._shadowNodes = [];
        },

        wireEvents() {
            this.wired = true;
            for (let i = 0; i < this.elements.length; i++) {
                const element = this.elements[i]
                this.own(this.addClickListener(element, lang.hitch(this, 'onSelect', i + 1)));
            }
        },

        onSelect(pos, e) {
            /**
             * This could be better and we coudl skip forwards when we are one before the arrow
             */
            this.stopPropagation(e);
            this.emitClick(e);
            this.setValue(pos);
            this.emitDataBinding(pos);
            this.emitStateChange("select", pos, e);
        },

        render(model, style, scaleX, scaleY) {
            this.model = model;
            this.max = model.props.max
            this.style = style;
            this._scaleX = scaleX;
            this._scaleY = scaleY;

            const db = new DomBuilder()
            this.domNode.innerText = ""
            this.elements = []
            const cntr = db.div('MatcWidgetTypeImagePagingCntr').build()
            for (let i = 0; i < this.max; i++) {
                const element = db.div('MatcWidgetTypeImagePagingElement').build(cntr)
                this._borderNodes.push(element)
                this._shadowNodes.push(element)
                this._backgroundNodes.push(element)
                this.elements.push(element)
            }
            this.domNode.appendChild(cntr)
            this.resize(model);
            this.setStyle(style, model);
            if (model.props && model.props.value !== null && model.props.value !== undefined) {
                this.setValue(model.props.value);
            }
        },

        resize(model) {
            this.elements.forEach((node) => {
                node.style.width = model.h + 'px'
            })
        },

        _setDataBindingValue(v) {
            this.setValue(v);
        },

        setValue(value) {
            this.value = value * 1
            const style = this.style
            this.elements.forEach((node, i) => {
                node.style.borderWidth = style.borderTopWidth + 'px'
                if (i + 1 == this.value) {
                    node.style.background = style.activeBackground
                    node.style.borderColor = style.activeBorderColor                 
                } else {
                    node.style.background = style.background
                    node.style.borderColor = style.borderTopColor
                }
            })
        },

        getValue() {
            return this.value;
        },

        getState() {
            return {
                type: "select",
                value: this.value
            };
        },

        setState: function (state) {
            if (state && state.type == "select") {
                this.setValue(state.value);
            }
        },

        onClick(e) {
            this.stopEvent(e);
            this.emitClick(e);
        },

    },
    mounted() { }
};
</script>