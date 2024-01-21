
<template>
    <div class="MatcVSlider MatcSlider">
      
        <div class="MatcSliderContainer" data-dojo-attach-point="cntr">
            <div class="MatcSliderMarkContainer" data-dojo-attach-point="markCntr"></div>
            <div class="MatcSliderBar" data-dojo-attach-point="bar"></div>
            <div class="MatcSliderHandle" data-dojo-attach-point="hndl"></div>
        </div>
     
    </div>
</template>
<style lang="scss">
    @import '../style//components/vslider.scss';
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import win from "dojo/_base/win";
import domGeom from "dojo/domGeom";

export default {
    name: "Slider",
    mixins: [DojoWidget],
    data: function () {
        return {
            value: 50,
            max: 100,
            min: 0,
            hasLabel: false,
            center: false,
            round: true,
            wire: true,
            hndlWidth: 5
        };
    },
    components: {},
    methods: {
        postCreate() {
            if (this.wire) {
                this.wireEvents();
            }
        },

        wireEvents() {
            this.own(this.addTouchStart(this.domNode, lang.hitch(this, "onDomPress")));
            this.own(this.addTouchStart(this.hndl, lang.hitch(this, "onHandlePress")));
        },

        startup() {
            this.init();
        },

        setMax(m) {
            this.max = m * 1;
        },

        setCenter(c) {
            this.center = c;
        },

        setMin(m) {
            this.min = m * 1;
        },

        setLegend(l) {
            this.legend = l * 1;
        },

        /**
         * Marks indicate some part on the slider, this is use full for the video player
         */
        setMarks(marks) {
            this.marks = marks;
        },

        placeAt(node) {
            if (node && node.toLowerCase) {
                node = document.getElementById(node);
            }
            node.appendChild(this.$el);
            this.init();
        },

        init(p) {
            if (p) {
                console.error('init called with pos???', new Error().stack)
            }
            this.min = this.min * 1;
            this.max = this.max * 1;

            /**
             * This is for the session player!
             */
            this.setValue(this.value)
        },

        getWidth() {
            if (this._width) {
                return this._width;
            }
            return domGeom.position(this.domNode).w;
        },

        onDomPress(e) {
            this.stopEvent(e);
            this.onClick(e);
            this.emit("click", this._value, e);
        },

        onHandlePress(e) {
            this.stopEvent(e);
            this.cleanup();
            this._touchMoveListner = this.addTouchMove(win.body(), lang.hitch(this, "onHandleMove"));
            this._touchReleaseListner = this.addTouchRelease(win.body(), lang.hitch(this, "onHandleRelease"));
            css.add(this.domNode, "MatcSliderMoving");
            this.emit("press", e);
            this.onClick(e);
        },

        onHandleMove(e) {
            this.stopEvent(e);
            this.onClick(e);
        },

        onHandleRelease(e) {
            this.stopEvent(e);
            this.cleanup();
            this.emit("release", e, this._value);
        },

        cleanup() {
            if (this._touchMoveListner) {
                this._touchMoveListner.remove();
            }
            if (this._touchReleaseListner) {
                this._touchReleaseListner.remove();
            }
            delete this._touchReleaseListner;
            delete this._touchMoveListner;
            css.remove(this.domNode, "MatcSliderMoving");
        },

        onClick(e) {
            var mPos = this._getMousePosition(e);
            var pos = domGeom.position(this.domNode);

            var dif = mPos.x - pos.x;
            var p = dif / pos.w;

            p = Math.min(Math.max(0, p), 1);

            var s = this.max - this.min;
            var w = s * p + this.min;

            if (this.round) {
                w = Math.round(w);
            }

            this.setValue(w);
            this.emit("change", w, e);
        },

        setValue(value) {
            value = Math.min(this.max, Math.max(this.min, value));

            var s = this.max - this.min;
            var p = Math.abs((value - this.min) / s);
            let w = 100
            let unit = '%'

            this.hndl.style.left = p * w - this.hndlWidth + unit;
            if (this.center) {
                if (value >= 0) {
                    this.bar.style.left = 0.5 * w + unit;
                    this.bar.style.width = (p - 0.5) * w + unit;
                } else {
                    this.bar.style.left = p * w + unit;
                    this.bar.style.width = (0.5 - p) * w + unit;
                }
            } else {
                this.bar.style.width = p * w + unit;
            }

            this._value = value;
        },

        getValue() {
            return this._value;
        }
    },
    mounted() { }
};
</script>