<template>
  <div class="MatcWidgetTypeDropDown">
    <div data-dojo-attach-point="button" class="MatcWidgetTypeDropDownCntr">
      <div class="MatcWidgetTypeDropDownLabelCntr" data-dojo-attach-point="labelCntr">
        <div data-dojo-attach-point="label" class="MatcWidgetTypeDropDownLabel">F</div>
      </div>
      <div data-dojo-attach-point="caretCnr" class="MatcWidgetTypeDropDownCarretCntr">
        <span data-dojo-attach-point="caret" class="MatcWidgetTypeDropDownCarret"></span>
      </div>
    </div>
    <div class="MatcWidgetTypeDropDownPopUp" role="menu" data-dojo-attach-point="popup"></div>
  </div>
</template>
<script>
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import DomBuilder from 'common/DomBuilder'
import DropDown from 'core/widgets/DropDown'

export default {
    name: 'HoverDropDown',
    mixins:[DropDown],
    data: function () {
        return {
            
        }
    },
    components: {},
    methods: {
        wireEvents (){
			this.own(this.addClickListener(this.domNode, lang.hitch(this, "onOpenHoverPopup", true)));
			this.own(on(this.domNode, touch.over, lang.hitch(this, "onOpenHoverPopup", false)));	
			this.own(on(this.domNode, touch.over, lang.hitch(this, "onDomMouseOver")));	
			this.own(on(this.domNode, touch.out, lang.hitch(this, "onDomMouseOut")));	
			this.wired = true;
		},
		
		onOpenHoverPopup (isClick, e){
			console.debug('onOpenHoverPopup')

			/**
			 * We add here a stupid div to catch mouse out events
			 * 
			 */
			if(!this.popupBackDrop){
				var db = new DomBuilder();
				this.popupBackDrop = db.div("MatcWidgetTypeHoverDropDownBackground").build(this.getScreenDiv());
				css.add(this.domNode, "MatcWidgetTypeHoverDropDownOpen");
				this.tempOwn(on(this.popupBackDrop, touch.over, lang.hitch(this, "onCloseHover" )));	
			}
			
			this.stopEvent(e);
			this.emitOpenPopup();
			this.renderPopup();	
			if(isClick){
				this.initCompositeState(this.getStateOptions(), e);
			} else {
				/**
				 * In contrast to the we do not pass the event to not have the click in the player...
				 */
				this.initCompositeState(this.getStateOptions());
			}
			
		
			return false;
		},
		
		
		onCloseHover (e){
			this.stopEvent(e);
			this.cleanUpBackDrop();
			this.cleanUp();
			/**
			 * In contrast to the we do not pass the event to not have a click...
			 */
			this.emitNoTransitionStateChange("close", "");		
		},
	
		
		cleanUpBackDrop (){
			if(this.popupBackDrop){
				var parent = this.popupBackDrop.parentNode;
				if(parent){
					parent.removeChild(this.popupBackDrop);
				}
			}
			delete this.popupBackDrop;
			css.remove(this.domNode, "MatcWidgetTypeHoverDropDownOpen");
		},

		beforeDestroy () {
			this.cleanUpBackDrop();
      		this.cleanUp();
   		}
    }, 
    mounted () {
    }
}
</script>