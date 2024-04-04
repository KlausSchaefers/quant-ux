
<template>
     <div :class="['VommondInput ', {'VommondInputOpenTop': top}]">
		<!-- removed form because entremight trigger reloead -->
		<input
			type="text"
			:class="['MatcIgnoreOnKeyPress', {'form-control': formControl}, {'vommondInlineEdit': inline}, {'MatcToobarInput MatcToobarInlineEdit': toolbar}]"
			data-dojo-attach-point="input"
		
			@focus="onFocus"
			:placeholder="placeholder"
			autocomplete="false" >
			<div v-if="isDropDown === true" class="VommondInputDropButton" @click="showAll">
				<span class="caret"></span>
			</div>
		<ul class="" role="menu" data-dojo-attach-point="ul">
		</ul>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import win from 'dojo/_base/win'
import on from 'dojo/on'
import touch from 'dojo/touch'
import domGeom from 'dojo/domGeom'
import Logger from 'common/Logger'

export default {
    name: 'Input',
	mixins:[DojoWidget],
	props:['fireOnBlur', 'top', 'placeholder', 'inline', 'formControl', 'hints', 'value', 'isDropDown', 'toolbar', 'actions', 'magicChar'],
    data: function () {
        return {

        }
    },
    components: {},
    methods: {
      postCreate: function(){
				this.own(on(this.input, "keyup", lang.hitch(this, "onKey")));
				if (this.fireOnBlur) {
					this.own(on(this.input, "blur", lang.hitch(this, "onBlur")));
				}
			},

			onBlur () {
				if (this.input.value) {
					this.emit('change', this.input.value)
				}
			},

			onFocus () {
				this.emit('focus', this.input.value)
			},

			blur () {
				this.input.blur()
			},

			showAll () {
				var suggestions = [];
				for(var i=0; i< this.hints.length; i++){
					var hint = this.hints[i];
					suggestions.push(hint);
				}
				if (suggestions.length > 0) {
					this.showSuggestion(suggestions);
				} else {
					this.showSuggestion([]);
				}
			},

			onKey (e){
				if(!this.hints){
					return;
				}

				if(this.suggestions){
					var key = e.which || e.keyCode;



					/**
					 * Stop on escape
					 */
					if (27 == key){
						this.hideSuggestion();
						return;
					}

					/**
					 * Down key
					 */
					if (40 == key){
						this.stopEvent(e);
						this.selected = Math.min(this.suggestions.length-1, this.selected+1);
						this.highlight(this.selected);
						return;
					}

					/**
					 * Up key
					 */
					if (38 == key){
						this.stopEvent(e);
						this.selected = Math.max(-1, this.selected-1);
						this.highlight(this.selected);
						return;
					}

					if (13 == key){

						if(this.selected >=0 && this.selected < this.suggestions.length){
							this.stopEvent(e);
							this.onSelect(this.suggestions[this.selected]);
							return;
						}
						if (this.suggestions.length == 1) {
							/**
							 * Here we do not want to trigger on action
							 */
							if (!this.suggestions[0].action) {
								this.stopEvent(e);
								this.onSelect(this.suggestions[0]);
								return;
							} else {
								console.debug("onKey() Ignore empty ENTER", )
							}

						}

						if (this.fireOnBlur) {
							this.emit('change', this.input.value)
							return
						} else {
							console.debug("onKey() Ignore empty ENTER", )
						}
					}
				}

				const suggestions = [];
				let value = this.input.value;
				if (value.length >=1){
					value = value.toLowerCase();
					for (let i=0; i< this.hints.length; i++){
						let hint = this.hints[i];
						if (hint._label.indexOf(value)>=0){
							suggestions.push(hint);
						}
					}
				}

				if (this.actions) {
					for (let i=0; i < this.actions.length; i++){
						let action = this.actions[i];
						suggestions.push(action);
					}
				}


				if(suggestions.length >0){
					this.showSuggestion(suggestions);
				} else {
					this.showSuggestion([]);
				}
			},

			showSuggestion (suggestions){
				if(!this.visible){
					let pos = domGeom.position(this.input);
					this.ul.style.width = pos.w + "px";
					css.add(this.domNode, "VommondInputOpen");
					this._mouseDownListener = on(win.body(),"mousedown", lang.hitch(this,"hideSuggestion"));
					this.visible = true;
					this.selected = -1;
				}

				this.cleanUpTempListener();
				this.ul.innerHTML = "";
				this.lis = [];
				for( let i=0; i < suggestions.length; i++){
					let s = suggestions[i];
					let li = document.createElement("li");
					li.innerHTML= s.label;
					if (s.css) {
						css.add(li, s.css)
					}
					this.ul.appendChild(li);
					this.lis.push(li);
					this.tempOwn(on(li, touch.press, lang.hitch(this, "onSelect", s)));
				}
				this.suggestions = suggestions;
			},

			highlight (pos){
				if (this.lis){
					for(var i=0; i< this.lis.length; i++){
						if(i== pos){
							css.add(this.lis[i], "VommonInputSelected");
							this.lis[i].scrollIntoView()
						} else {
							css.remove(this.lis[i], "VommonInputSelected");
						}
					}
				}
			},

			onSelect (s){
				if (s.action) {
					this.emit(s.action, s)
				} else {
					this.input.value = s.value;
					this.emit('change', s.value)
					this.hideSuggestion();
				}
			},

			clear () {
				this.setValue('')
			},

			setValue (value) {
				this.input.value = value;
			},

			hideSuggestion (){
				css.remove(this.domNode, "VommondInputOpen");
				if(this._mouseDownListener){
					this._mouseDownListener.remove();
				}
				this.visible = false;
				this.lis = null;
				this.selected = -1;
				this.cleanUpTempListener();
			},

			setCss (clazz){
				css.add(this.input, clazz);
			},

			setPlaceholder (plchldr){
				this.input.placeholder = plchldr;
			},

			focus (){
				this.input.focus();
			},

			getValue (){
				return this.input.value;
			},

			setHints (hints){
				for(var i=0; i< hints.length; i++){
					hints[i]._label = hints[i].label.toLowerCase();
				}
				this.hints = hints;
			},
			destroy:function(){
				this.hideSuggestion();
				this.cleanUpTempListener();
			}
		},
		watch: {
			fireOnBlur (v) {
				this.log.log(2, 'watch(fireOnBlur)', 'enter', v)
				this.fireOnBlur = v
			},
			top (v) {
				this.log.log(2, 'watch(top)', 'enter', v)
				this.top = v
			},
			placeholder (v) {
				this.log.log(2, 'watch(placeholder)', 'enter', v)
				this.placeholder = v
			},
			inline (v) {
				this.log.log(2, 'watch(inline)', 'enter', v)
				this.inline = v
			},
			hints (v) {
				this.log.log(2, 'watch(hints)', 'enter', v)
				this.setHints(v)
			},
			formControl (v) {
				this.log.log(2, 'watch(formControl)', 'enter', v)
				this.formControl = v
			},
			value (v) {
				this.setValue(v)
			},
			isDropDown (v) {
				this.isDropDown = v
			}
		},
    mounted () {
		this.log = new Logger("Input");
		if (this.hints) {
			this.setHints(this.hints)
		}
		if (this.value) {
			this.setValue(this.value)
		}
		this.log.log(0, 'mounted', 'enter ')
    }
}
</script>