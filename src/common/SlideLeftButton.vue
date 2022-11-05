
<template>
  <div class="VommondSlideLeftButton">
		<div type="button" class="VommondSlideLeftButtonLabel" data-dojo-attach-point="button"> 
			<span data-dojo-attach-point="label" class="MatcPointer mdi mdi-dots-horizontal"></span> 
		</div>
		<div class="VommondSlideLeftPopup" data-dojo-attach-point="popup">
			<div class="VommondSlideLeftPopupCntr" data-dojo-attach-point="cntr">
			</div>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'

export default {
    name: 'SlideLeftButton',
		mixins:[DojoWidget],
    data: function () {
        return {
            value: false, 
            hasObjects: false, 
            updateLabel: true, 
            maxLabelLength: -1, 
            openCSS: "VommondSlideLeftPopupOpen", 
            labelCSS: "VommondSlideLeftPopupOpenLabel", 
            isOpen: false
        }
    },
    components: {},
    methods: {
      postCreate: function(){
				this._lis={};
				this.own(on(this.button, touch.press, lang.hitch(this, "toggleDropDown")));
			},		
			
			toggleDropDown (e){			
				this.stopEvent(e);		
				if(this.isOpen){
					css.remove(this.domNode, this.openCSS);		
				} else {
					css.add(this.domNode, this.openCSS);	
				}
				this.isOpen = !this.isOpen;
			},				
			
			setOptions (list){
				this._lis={};
				var selectedValue = null;
				for(var i=0; i < list.length; i++){
					var o = list[i];
					var li = document.createElement("a");		
					css.add(li, "VommondSlideLeftPopupOpenItem");
					if((o.label || o.icon) && o.value!=null){
						this.hasObjects = true;
						if(o.icon){
							var icon = document.createElement("span");
							// css.add(icon,this.iconCSS);
							css.add(icon, o.icon);
							li.appendChild(icon);
						}
						if(o.label){
							var lbl = document.createElement("a");
							css.add(lbl,this.labelCSS);
							lbl.innerHTML=o.label;
							li.appendChild(lbl);
						}
						if(o.selected){
							selectedValue = o.value;
						}
						if(o.href){
							li.href=o.href;
						} else if(o.callback){
							this.own(on(li, touch.press, o.callback));
						} else {
							this.own(on(li, touch.press, lang.hitch(this, "onChange", o.value)));
						}
				
						this._lis[o.value] = li;
					} else {
						li.innerHTML = o;
						this._lis[o] = li;
						this.own(on(li, touch.press, lang.hitch(this, "onChange", list[i])));
					}					
					this.cntr.appendChild(li);
				}				
				this._options = list;			
				if(selectedValue){
					this.setValue(selectedValue);
				}		
			},
			
			onChange (value, e){	
				this.stopEvent(e);			
				this.emit("change", value ,e);
			}
    }, 
    mounted () {
    }
}
</script>