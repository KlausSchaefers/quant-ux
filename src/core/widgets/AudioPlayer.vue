<template>
    <div class="MatcWidgetAudioPlayer">
        <div class="MatcWidgetTypeAudioPlayerIconBack" ref="backCntr">
            <div class="MatcWidgetTypeAudioPlayerIcon">
                <span :class="icon" ref="iconNode" />
            </div>
            <audio ref="audio" >
                <source :src="source" type="audio/mpeg">
            </audio>
        </div>
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
            duration: 0,
            progress: 0,
            currentTime: 0,
            backgroundImage: ''
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
                const audioElement = this.$refs.audio
                audioElement.addEventListener("ended", () => {
                    this.setValue(false)            
                })
                audioElement.addEventListener("loadeddata", () => {
                    this.duration = audioElement.duration;
                });
                audioElement.addEventListener("timeupdate", () => {
                    this.currentTime = audioElement.currentTime
                    const p = Math.round((audioElement.currentTime / this.duration ) * 100)
                    this.setProgress(p)     
                })
            }
        },

        onDomMouseOut () {
            this.setBtnStyle();
        },

        setProgress (p) {
            if (p !== this.progress) {
                this.progress = p
                this.emitDataBinding(this.progress)
            }
            if (this.model?.props?.animated) {
                this.renderProgress(p)
            }
        },

        renderProgress(p) {
                
            const w = this.model.w * 2;
			const h = this.model.h * 2;
			const x = Math.round(Math.min(w,h) / 2) 
            const lineWidth = Math.max(4,this._getBorderWidth(this.style.borderTopWidth * 2));
            const radisuOffset = this.style.borderTopWidth > 1 ? 1 : 0

            const canvas = document.createElement("canvas");
			canvas.width=w;
			canvas.height=h;

	 	    const ctx = canvas.getContext("2d")
            const s = this._degreesToRadians(0)
			const e = this._degreesToRadians(360 * (p / 100))  
			const r = (w/2 - lineWidth/2) + radisuOffset
            ctx.lineWidth = lineWidth
    
            if (this.value && this.model.active) {
                ctx.strokeFill = this.model.active.borderTopColor
                ctx.strokeStyle = this.model.active.borderTopColor
            } else {
                ctx.strokeColor = this.model.style.borderTopColor
                ctx.strokeStyle = this.model.style.borderTopColor
            }

            ctx.beginPath()
            ctx.arc(x,x, r, s, e) 
            ctx.stroke()       
			this.$refs.backCntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";
        },

        _degreesToRadians(degrees) {
			return (degrees * (Math.PI / 180)) - Math.PI / 2;
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
                    setTimeout(() => {
                        this.$refs.audio.currentTime = 0;
                    }, 100)

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