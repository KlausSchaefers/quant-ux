<script>
import domAttr from 'dojo/domAttr'
import css from 'dojo/css'

export default {
    name: 'InlineEdit',
    mixins:[],
    data: function () {
        return {
            
        }
    },
    components: {},
    methods: {
        inlineEditInit (widget){
			this.logger.log(0,"inlineEditInit", "enter");
			this.cleanUpInlineEdit();
			
			var div = this.renderFactory.getLabelNode(widget);
			if(div){
				this._inlineEditWidget = widget;
				this._inlineEditDiv = div;
				this._inlineFocus(null, false);
			} 
		},
		
		inlineEditKeyPress (e){
			if(!this._inlineEditStarted){
				if(this._selectWidget){
					var div = this.renderFactory.getLabelNode(this._selectWidget);
					if(div){
						this.logger.log(0,"inlineEditKeyPress", "enter");
						this._inlineEditWidget = this._selectWidget;
						this._inlineEditDiv = div;
						this._inlineFocus(e, false);
					}
				} 
			}
		},
		
		
		inlineEditGetCurrent (){
			if(this._inlineEditWidget && this._inlineEditStarted){
				var div = this.renderFactory.getLabelNode(this._inlineEditWidget);
				if(div){
					var txt = div.innerHTML;	
					txt =txt.replace(/<br>/g, "\n");
					txt =txt.replace(/%/g, "$perc;"); // Mongo cannot deal with % on undo
					if(txt != this._inlineInnerHTML){
						return txt;
					}
				}
			}
		},
		
		inlineEditStop (){
			
			if(this._inlineEditWidget && this._inlineEditStarted){
				var div = this.renderFactory.getLabelNode(this._inlineEditWidget);
				if(div){
					var txt = div.innerHTML;	
					txt =txt.replace(/<br>/g, "\n");
					txt =txt.replace(/%/g, "$perc;"); // Mongo cannot deal with % on undo
					if(txt != this._inlineInnerHTML){
						var id  = this._inlineEditWidget.id;
						
						/**
						 * In case of zoom we might flush the value, which will
						 * not trigger a rerender(). However, the zooming sets the 
						 * "old" model in the canvas, which still has the old txt.
						 * We update this in here. 
						 */
						if(this.model.widgets[id]){
							this.model.widgets[id].props.label = txt;
						}
						
						/**
						 * cleanup before calling the controller, because the controller might 
						 * trigger an rerender > onChangedSelection > etc recursive 
						 * loop!
						 */
						this.cleanUpInlineEdit();
						this.logger.log(1,"inlineEditStop", "exit > FLUSH > " + txt);
					
						this.controller.updateWidgetProperties(id, {label : txt}, "props", true);
						return txt;
					} else {
						this.logger.log(3,"inlineEditStop", "exit > no chnage!");
					}	
				}	
			}
			this.cleanUpInlineEdit();
		},
		
		
		
		inlineEditStarted  (){
			return this._inlineEditStarted;
		},
		
		
		_inlineFocus (e, doNotEmptyOnNull){
			
			/**
			 * FIXME. We have to somehow stop this event from doing something false.
			 * If there is no label, the first time stopProgationFails. Therefore 
			 * we set no all labels to all value! In that case stopEvent() works better...
			 */
			if(e){
				e.stopPropagation();
			}
				
			if(!this._inlineEditStarted && this._inlineEditDiv){
				
				if(!this._inlineEditWidget.props.label &&!doNotEmptyOnNull){
				    this._inlineEditDiv.innerHTML = "";
				} 

				this._inlineInnerHTML = this._inlineEditDiv.innerHTML;
				domAttr.set(this._inlineEditDiv, "contenteditable", true);
				this._inlineEditDiv.setAttribute("contentEditable", true);
				this._inlineEditDiv.focus();
				css.add(this._inlineEditDiv,"MatcInlineEditableStarted");
				this.setEndOfContenteditable(this._inlineEditDiv);
				
				css.add(this.domNode, "MatcCanvasModeInlineEdit");
				
			}
		
			this._inlineEditStarted = true;
			
			return true;
		},
		
		
		
		
		_inlineOnBlur (){
			this._inlineEditStarted = false;
		},
		
		onInlineEditMouseDown (e){
			this.stopEvent(e);
		},
		
		
		cleanUpInlineEdit (){
			this.logger.log(4,"cleanUpInlineEdit", "enter");
			
			if(this._inlineEditDiv){
				domAttr.set(this._inlineEditDiv, "contenteditable", false);
				this._inlineEditDiv.setAttribute("contentEditable", false);
				this._inlineEditDiv.blur();
				css.remove(this._inlineEditDiv,"MatcInlineEditableStarted");
				this._inlineEditDiv = null;
			}
			
			if(this._inlineMouseDown){
				this._inlineMouseDown.remove();
				this._inlineMouseDown=null;
			}
		
			if(this._inlineMouseUp){
				this._inlineMouseUp.remove();
				this._inlineMouseUp = null;
			}
		
			this._inlineEditWidget = null;
			this._inlineInnerHTML = null;
			this._inlineEditStarted = false;
			
			if(this._inlinebBlurListener){
				this._inlinebBlurListener.remove();
				this._inlinebBlurListener = null;
			}
			if (this.domNode) {
				css.remove(this.domNode, "MatcCanvasModeInlineEdit");
			}
			
			//this.setControllerCallback(null);
			
		},
		
		setEndOfContenteditable (contentEditableElement){
		    var range,selection;
		    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
		    {
		        range = document.createRange();//Create a range (a range is a like the selection but invisible)
		        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
		        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
		        selection = window.getSelection();//get the selection object (allows you to change selection)
		        selection.removeAllRanges();//remove any selections already made
		        selection.addRange(range);//make the range you have just created the visible selection
		    }
		    else if(document.selection)//IE 8 and lower
		    { 
		        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
		        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
		        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
		        range.select();//Select the range (make it the visible selection
		    }
		}
    }, 
    mounted () {
    }
}
</script>