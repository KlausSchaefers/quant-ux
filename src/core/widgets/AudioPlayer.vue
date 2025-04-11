<template>
    <div class="MatcWidgetIconToggleButton">
        <div class="MatcWidgetTypeAudioPlayerIcon">
            <span :class="icon" ref="iconNode" />
        </div>
        <audio ref="audio" >
            <source :src="source" type="audio/mpeg">
        </audio>

    </div>
</template>
<style></style>

<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";
import touch from "dojo/touch";

export default {
    name: "AudioPlayer",
    mixins: [UIWidget, DojoWidget],
    data: function () {
        return {
            value: false,
            style: {},
            model: {},
            isWired: false,
            isPlaying: false,
            topic: "MatcWidgetIconToggleButton"
        };
    },
    components: {},
    computed: {
        label() {
            if (this.model && this.model.props) {
                return this.model.props.label
            }
            return ''
        },
        source() {
            if (this.model && this.model?.props?.file) {
                const file = this.model.props.file
                if (file.url) {
                    if (this.hash) {
                        return "/rest/uploads/" + this.hash + "/" + file.url;
                    } else if (this.jwtToken) {
                        return "/rest/uploads/" + file.url + "?token=" + this.jwtToken;
                    }
                }

            }
            return ''
        },
        icon() {
            if (this.model && this.model.style) {
                if (!this.value) {
                    return 'mdi ' + this.model.style.playIcon
                } else {
                    return 'mdi ' + this.model.style.stopIcon
                }
            }
            return ''
        },
        size() {
            if (this.bbox) {
                return Math.round(Math.min(this.bbox.h, this.bbox.w) * 0.6) + 'px'
            }
            return '20px'
        }
    },
    methods: {
        postCreate() {
            this._borderNodes = [this.$el];
            this._backgroundNodes = [this.$el];
            this._shadowNodes = [this.$el];
            this._labelNodes = [this.$el];
        },

        wireEvents() {
            this.isWired = true
            this.own(this.addClickListener(this.domNode, lang.hitch(this, 'onChange')));
            this.wireHover(touch.enter, touch.leave)
            if (this.$refs.audio) {
                this.$refs.audio.addEventListener("ended", () => {
                    this.setValue(false)
                })
            }
        },

        onDomMouseOut () {
            this.setBtnStyle();
        },

        onChange(e) { 
            this.setValue(!this.value);
            this.emit("change", this.value);
            this.emitClick(e);
        },

        play() {
            if (!this.isWired) {
                return
            }
            try {
                if (this.$refs.audio) {
                    this.$refs.audio.play()
                }
            } catch (e) {
                console.error("play", e)
            }

        },

        stop () {
            if (!this.isWired) {
                return
            }
            try {
                if (this.$refs.audio) {
                    this.$refs.audio.pause()
                    this.$refs.audio.currentTime = 0;
                }
            } catch (e) {
                console.error("stop", e)
            }

        },

        getLabelNode() {
            return this.$refs.labelNode;
        },

        render(model, style, scaleX, scaleY) {
            this.model = model;
            this.style = style;
            this._scaleX = scaleX;
            this._scaleY = scaleY;

            this.setStyle(style, model);
            if (model.props && model.props.autoPlay !== undefined) {
                // fire auto play only in simulator
                setTimeout(() => {
                    if (!this.isWired) {
                        return
                    }
                    this.setValue(model.props.autoPlay);
                }, 200)       
            }
        },

        _set_iconSize(parent, style) {
            if (this.$refs.iconNode) {
                const w = this._getBorderWidth(style.iconSize);
                this.$refs.iconNode.style.fontSize = w + "px";
            }
        },

        getValue() {
            return this.value;
        },

        setValue(value) {
            this.value = value;


            this.setBtnStyle();
            if (this.value) {
                this.play()
            } else {
                this.stop()
            }

        },

        setBtnStyle() {
            if (this.value && this.model.active) {
                const active = this.model.active
                this.$el.style.background = active.background
                this.$el.style.color = active.color
                this.$el.style.borderColor = active.borderTopColor
            } else {
                this.$el.style.background = this.style.background
                this.$el.style.color = this.style.color
                this.$el.style.borderColor = this.style.borderTopColor
            }
        },

        getState() {
            return {
                type: 'value',
                value: ''
            };
        },

        setState(state) {
            if (state && state.type == 'value') {
                this.setValue(state.value);
            }
        },


        onClick(e) {
            this.stopEvent(e);
            this.emitClick(e);
        },


        getFormGroup(widget) {
            if (widget.props) {
                return widget.props.formGroup;
            }
        }
    }
};
</script>