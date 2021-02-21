<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import win from 'dojo/_base/win'
import topic from 'dojo/topic'

export default {
    name: 'CustomHandler',
    mixins:[],
    data: function () {
        return {
        }
    },
    components: {},
    methods: {
        showCustomHandlers (widget) {
			if (this.renderFactory && this.hasCustomHandler) {
                let uiWidget = this.renderFactory.getUIWidget(widget)
				if (uiWidget && uiWidget.getHandlers) {
                    let handlers = uiWidget.getHandlers()

                  	if (handlers) {
                        this.logger.log(1,"showCustomHandlers", "enter > " +  widget.id + " > #: " + handlers.length);
						this.customHandlers = []
						var l = (this.resizeButtonSize *2) + 1;
						handlers.forEach(handler => {
                            var div = document.createElement("div");
                            if (handler.size) {
                                div.style.width = handler.size.width * this.getZoomFactor() + "px";
                                div.style.height = handler.size.height * this.getZoomFactor()  + "px";
                            } else {
                                div.style.width = l + "px";
                                div.style.height = l + "px";
                            }

                            this._addSizeHandlerTouch(div)

                            css.add(div, "MatcCutsomerHandler " + handler.icon);

							var listener = this.createCustomerHandlerListener(div, widget, uiWidget, handler)

							this.dndContainer.appendChild(div);
							this.customHandlers.push({
								div: div,
								handler: handler,
                                listener: listener,
                                widget: widget
							})

						})
					}
				}
			}
        },

        createCustomerHandlerListener (div, widget, uiWidget, handler) {
            if (handler.onClick) {
                return on(div,"mousedown", lang.hitch(this,"onCustomHandlerClick", widget, uiWidget, div, handler));
            }
            return on(div,"mousedown", lang.hitch(this,"onCustomHandlerStart", widget, uiWidget, div, handler));
        },

        onCustomHandlerClick (widget, uiWidget, div, handler, e) {
            this.logger.log(-1,"onCustomHandlerClick", "enter > " +  widget.id);
            this.stopEvent(e);


            let command = uiWidget.getHandlerCommand(null, handler)
            if (command) {
                if (command.type === 'props') {
                    this.controller.updateWidgetProperties(widget.id, command.change, command.type)
                }
            }
        },

        onCustomHandlerStart (widget, uiWidget, div, handler, e) {
            this.stopEvent(e);
			this.logger.log(-1,"onCustomHandlerStart", "enter > " +  widget.id);
            topic.publish("matc/canvas/click", "", "");
            this.inlineEditStop();

			// this is wrong if we want to have snappz stuff
			// we have to select depending on the type.. arghh
			this._customHandlerStartPos = this.getCanvasMousePosition(e);
            this._customerHandlerCursor = handler.cursor
			css.add(this.container, this._customerHandlerCursor);

			/**
			 * register mouse move and release listener
             * FIXME: Add ESC liszener
			 */
			this._customHandlerMove = on(win.body(),"mousemove", lang.hitch(this,"onCustomHandlerMove", widget, uiWidget, div, handler));
			this._customHandlerUp = on(win.body(),"mouseup", lang.hitch(this,"onCustomHandlerEnd", widget, uiWidget, div, handler));
        },

        onCustomHandlerMove (widget, uiWidget, div, handler, e) {
            this.logger.log(4,"onCustomHandlerMove", "enter > " +  widget.id);
            this.stopEvent(e);

            this._customHandlerMovePos = this.getCanvasMousePosition(e);
            let difY = this._customHandlerMovePos.y - this._customHandlerStartPos.y
            let difX = this._customHandlerMovePos.x - this._customHandlerStartPos.x

            let change = lang.clone(handler)
            change.difY = difY,
            change.difX = difX

            let handlerPos = uiWidget.onHandlerChange(change)
            if (handlerPos) {
                requestAnimationFrame(() => {
                    div.style.top = widget.y + handlerPos.y + 'px'
                    div.style.left = widget.x + handlerPos.x + 'px'
                })
            }
        },

        onCustomHandlerEnd (widget, uiWidget, div, handler, e) {
            this.logger.log(4,"onCustomHandlerEnd", "enter > " +  widget.id);
            this.stopEvent(e)

            if (this._customHandlerMovePos) {
                let difY = this._customHandlerMovePos.y - this._customHandlerStartPos.y
                let difX = this._customHandlerMovePos.x - this._customHandlerStartPos.x

                let change = lang.clone(handler)
                change.difY = difY,
                change.difX = difX

                let command = uiWidget.getHandlerCommand(change, handler)
                if (command) {
                    if (command.type === 'props') {
                        this.controller.updateWidgetProperties(widget.id, command.change, command.type)
                    }
                }
            }

            this.cleanUpCustomHandlersDND();
        },

        cleanUpCustomHandlersDND () {
            this._customHandlerMove.remove()
            this._customHandlerUp.remove()
            delete this._customHandlerMove
            delete this._customHandlerUp

            delete this._customHandlerMovePos
            delete this._customHandlerStartPos

            if (this._customerHandlerCursor && this.container){
				css.remove(this.container, this._customerHandlerCursor);
			}
        },

        updateCustomHandlers (box) {
            if (this.customHandlers) {
                this.customHandlers.forEach(h => {
                    let div = h.div
                    let handler = h.handler
                    div.style.top = box.y + handler.y + 'px'
                    div.style.left = box.x + handler.x + 'px'
                })
            }
        },

        cleanUpCustomHandlers () {
            if (this.customHandlers) {
                let list = this.customHandlers
                delete this.customHandlers
				list.forEach(h => {
					var node = h.div
					var parent = node.parentNode;
					if(parent){
						parent.removeChild(node);
					}
					if (h.listener) {
						h.listener.remove()
					}
				})
            }

        }
    }
}
</script>