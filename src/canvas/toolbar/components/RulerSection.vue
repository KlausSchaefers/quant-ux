
<template>
     <div class="">

        <div data-dojo-attach-point="layerX" class="MatcToolbarFlexCntr MatcBoxSize">
			<div class="MatcToolbarItem MatcToolbarItemSmall " >
				<span class="MatcBoxSizeLabel">{{label1}} :</span>
				<input 
                    class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" 
                    :value="value1" 
                    @keydown.stop="" 
                    @keyup.stop="setV1" 
                    @change="onChangeV"/>
			</div>			
			<div class="MatcToolbarItem MatcToolbarItemSmall" >
				<span class="MatcBoxSizeLabel">{{label2}} :</span>
				<input 
                    class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" 
                    :value="value2" 
                    @keydown.stop=""
                    @keyup.stop="setV2" 
                    @change="onChangeV"/>
			</div>		
		</div>
        <div class="MatcToolbarItem">
		    <CheckBox label="Sticky ruler" :value="sticky" @change="onStickyChange"/>
        </div>
        <div class="MatcToolbarItem">
		    <CheckBox label="Resize Components" :value="resize" @change="onResizeChange" v-show="sticky"/>
        </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import CheckBox from 'common/CheckBox'

export default {
    name: 'BoxBorder',
    mixins:[DojoWidget],
    data: function () {
        return {
            sticky: false,
            resize: false,
            screen: null,
            v: 0,
            type: 'y'
        }
    },
    components: {
        'CheckBox': CheckBox
    },
    computed: {
        label1 () {
            if (this.type === 'y') {
                return 'T'
            }
            return 'L'
        },
        label2 () {
            if (this.type === 'y') {
                return 'B'
            }
            return 'R'
        },
        value1 () {
            return this.v
        },
        value2 () {
            if (this.screen) {
                if (this.type === 'y') {
                    return this.screen.h - this.v
                }
                return this.screen.w - this.v
            }
            return '';
        }
    },
    methods: {
        onStickyChange (value){
            this.sticky = value
            this.onChangeProps()
        },
        onResizeChange (value) {
            this.resize = value
            this.onChangeProps()
        },
        onChangeProps () {
    	    this.emit("changeProps", {
                sticky: this.sticky,
                resize: this.resize
            });
        },
        setV1 (e) {
            let v = e.target.value
            if (this.isValid(v)) {
                this.v = v * 1
            } else {
                console.debug('setV1() wrong value', v)
            }
        },
        setV2 (e) {
            let v = e.target.value
             if (this.isValid(v) && this.screen) {
                if (this.type === 'y') {
                    v = v * 1
                    this.v = this.screen.h - v
                } else {
                    this.v = this.screen.w - v
                }
            } else {
                console.debug('setV2() wrong value', v)
            }
        },
        onChangeV () {
            this.emit("changeV", this.v);
        },
        setValue (screen, ruler) {
            if (ruler.props) {
                this.sticky = ruler.props.sticky === true
                this.resize  =ruler.props.resize === true
            } else {
                this.sticky = false
                this.resize = false
            }
            this.v = ruler.v
            this.type = ruler.type
            this.screen = screen
        },
        isValid (value){
			var er = /^-?[0-9]+$/;
			var valid =  er.test(value);
			if(!valid){
				return false;
			}
			if(value > 0){
				return true;
			}
			return false;
		},
    }, 
    mounted () {
    }
}
</script>