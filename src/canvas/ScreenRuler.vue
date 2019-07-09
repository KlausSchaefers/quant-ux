<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import win from 'dojo/_base/win'
// import domStyle from 'dojo/domStyle'

export default {
    name: 'ScreenGrid',
    mixins:[],
    data: function () {
        return {
        }
    },
    components: {},
    methods: {
        renderScreenButtons (dndDiv, screen) {
            this.logger.log(0,"renderScreenButtons", "enter", screen);

            this._screenButtonsListeners = []
           
           	let top = document.createElement("div");		
            css.add(top, "MatcScreenGridButtonTop");
            dndDiv.appendChild(top)	
            let topListener = on(top, 'mousedown', lang.hitch(this, '_onScreenTopMouseDown', screen, dndDiv))
            this._screenButtonsListeners.push(topListener)

            let left = document.createElement("div");		
            css.add(left, "MatcScreenGridButtonLeft");
            dndDiv.appendChild(left)
            let leftListener = on(left, 'mousedown', lang.hitch(this, '_onScreenLeftMouseDown', screen, dndDiv))
            this._screenButtonsListeners.push(leftListener)

            this._renderScreenRulers(screen, screen.rulers, dndDiv)
        },

        _renderScreenRulers(screen, rulers, dndDiv) {
            console.debug('_renderScreenRulers', rulers)
            /**
             * Rulers come unzoomed...
             */
            let z = this.getZoomFactor();
            if (rulers){
                this._cleanUpScreenRulerHandlers()
                this._screenRulerHandles = rulers.map(ruler => {

                    let handle = document.createElement("div");		
                    css.add(handle, " MatcScreenGridHandle MatcScreenGridHandle" + ruler.type);
                    dndDiv.appendChild(handle)

                    if (ruler.type === 'y') {
                        handle.style.top = ruler.v * z + 'px'
                    } else {
                        handle.style.left = ruler.v * z + 'px'
                    }
                     let listener = on(handle, 'mousedown', lang.hitch(this, '_onScreenRulerHandleDown', screen, ruler, dndDiv, handle))
                    return {
                        div: handle,
                        listener: listener
                    }
                })
            }
        },

        _onScreenRulerHandleDown (screen, ruler, dndDiv, handle, e) {
            this.stopEvent(e)
            this._screenButtonsListenerMove = on(win.body(),"mousemove", lang.hitch(this,"_onScreenRulerHandleMove", screen, ruler, dndDiv, handle));
			this._screenButtonsListenerUp = on(win.body(),"mouseup", lang.hitch(this,"_onScreenRulerHandleUp", screen, ruler, dndDiv, handle));
        },

        _onScreenRulerHandleMove (screen, ruler, dndDiv, handle, e) {
            this.stopEvent(e)

            let pos = this.getCanvasMousePosition(e);
            if (ruler.type === 'y') {
                handle.style.top = (pos.y - screen.y) + 'px';
                if (pos.y > screen.y && pos.y < (screen.y + screen.h)) {
                    css.remove(handle, 'MatcScreenGridHandleDel')
                } else {
                    css.add(handle, 'MatcScreenGridHandleDel')
                }
            } else {
                handle.style.left = (pos.x - screen.x) + 'px';
                if (pos.x > screen.x && pos.x < (screen.x + screen.w)) {
                    css.remove(handle, 'MatcScreenGridHandleDel')
                } else {
                    css.add(handle, 'MatcScreenGridHandleDel')
                }
            }
        },

        _onScreenRulerHandleUp (screen, ruler, dndDiv, handle, e) {
            this.stopEvent(e)
            this.cleanUpScreenButtonMove()

            let rulers = null
            let pos = this.getCanvasMousePosition(e);
            if (ruler.type === 'y') {
                if (pos.y > screen.y && pos.y < (screen.y + screen.h)) {
                    rulers = this.controller.updateScreenRuler(screen.id, pos, ruler)
                } else {
                    this.showError('Ruler removed')
                    rulers = this.controller.removeScreenRuler(screen.id, ruler)
                }
            } else {
                handle.style.left = (pos.x - screen.x) + 'px';
                if (pos.x > screen.x && pos.x < (screen.x + screen.w)) {
                    rulers = this.controller.updateScreenRuler(screen.id, pos, ruler)
                } else {
                    this.showError('Ruler removed')
                    rulers = this.controller.removeScreenRuler(screen.id, ruler)
                }
            }
            if (rulers) {
                /**
                 * Make a temp update here
                 */
                screen.rulers = rulers
                this._renderScreenRulers(screen, rulers, dndDiv)
            }
        },

        _cleanUpScreenRulerHandlers () {
            if (this._screenRulerHandles) {
                this._screenRulerHandles.forEach(h => {
                    h.listener.remove()
                    if (h.div.parentNode) {
                        h.div.parentNode.removeChild(h.div)
                    }
                })
            }
        },

        _onScreenTopMouseDown (screen, dndDiv, e) {
            this.stopEvent(e)
            this._screenButtonsListenerMove = on(win.body(),"mousemove", lang.hitch(this,"onScreenTopMove", screen, dndDiv));
			this._screenButtonsListenerUp = on(win.body(),"mouseup", lang.hitch(this,"onScreenTopUp", screen, dndDiv));
        },

        onScreenTopMove (sceen, dndDiv, e) {
            if (!this._screenButtonMoveLine) {
                this._screenButtonMoveLine = document.createElement('div')
                css.add(this._screenButtonMoveLine, 'MatcScreenGridButtonTopLine')
                this.widgetContainer.appendChild(this._screenButtonMoveLine);
            }
            this.stopEvent(e);
            let pos = this.getCanvasMousePosition(e);
            this._screenButtonMoveLine.style.top = pos.y + 'px';
        },

        onScreenTopUp (screen, dndDiv, e) {
            this.cleanUpScreenButtonMove();
            let pos = this.getCanvasMousePosition(e);
            if (pos.y > screen.y) {
                let rulers = this.controller.addScreenRuler(screen.id, pos, 'y')
                if (rulers) {
                    /**
                     * Make a temp update here
                     */
                    screen.rulers = rulers
                    this._renderScreenRulers(screen, rulers, dndDiv)
                }
            } else {
                this.showError('Rulers must be placed on a screen')
            }
        },

        _onScreenLeftMouseDown (screen, dndDiv, e) {
            this.stopEvent(e)
            this._screenButtonsListenerMove = on(win.body(),"mousemove", lang.hitch(this,"onScreenLeftMove", screen, dndDiv));
			this._screenButtonsListenerUp = on(win.body(),"mouseup", lang.hitch(this,"onScreenLeftUp", screen, dndDiv));
        },

        onScreenLeftMove (sceen, dndDiv, e) {
            
            if (!this._screenButtonMoveLine) {
                this._screenButtonMoveLine = document.createElement('div')
                css.add(this._screenButtonMoveLine, 'MatcScreenGridButtonLeftLine')
                this.widgetContainer.appendChild(this._screenButtonMoveLine);
            }
            this.stopEvent(e);
            
            let pos = this.getCanvasMousePosition(e);
            this._screenButtonMoveLine.style.left = pos.x + 'px';
        },

        onScreenLeftUp (screen, dndDiv, e) {
            this.cleanUpScreenButtonMove();
            let pos = this.getCanvasMousePosition(e);
            if (pos.x > screen.x) {
                let rulers = this.controller.addScreenRuler(screen.id, pos, 'x')
                if (rulers) {
                    /**
                     * Make a temp update here
                     */
                    screen.rulers = rulers
                    this._renderScreenRulers(screen, rulers, dndDiv)
                }
            } else {
                this.showError('Rulers must be placed on a screen')
            }
        },


        cleanUpScreenButtonMove () {
            this.logger.log(0,"cleanUpScreenButtonMove", "enter");
            if (this._screenButtonMoveLine && this._screenButtonMoveLine.parentNode){
                this._screenButtonMoveLine.parentNode.removeChild(this._screenButtonMoveLine)
            }
            if (this._screenButtonsListenerMove) {
                this._screenButtonsListenerMove.remove()
            }
            if (this._screenButtonsListenerUp) {
                this._screenButtonsListenerUp.remove()
            }
            delete this._screenButtonsListenerUp
            delete this._screenButtonsListenerMove
            delete this._screenButtonMoveLine
        },

        cleanUpScreenButtons () {
            this.logger.log(0,"cleanUpScreenButtons", "enter");
            this.cleanUpScreenButtonMove()
            this._cleanUpScreenRulerHandlers()
            if (this._screenButtonsListeners){
                this._screenButtonsListeners.forEach(listener => {
                    listener.remove()
                })
            }
            delete this._screenButtonsListeners
        },
    }
}
</script>