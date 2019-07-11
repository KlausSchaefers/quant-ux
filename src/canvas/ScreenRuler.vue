<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import win from 'dojo/_base/win'
import Core from 'core/Core'
import CheckBox from 'common/CheckBox'

export default {
    name: 'ScreenGrid',
    mixins:[],
    data: function () {
        return {
        }
    },
    components: {},
    methods: {

        initScreenRuler () {
            if(this.rulerCntr){
                this.rulerChkBox = this.$new(CheckBox);
                this.rulerChkBox.setLabel("Show Ruler");
                this.rulerChkBox.setValue(this.settings.showRuler);
                this.rulerChkBox.placeAt(this.rulerCntr);
                this.own(on(this.rulerChkBox, "change", lang.hitch(this, "setShowScreenRuler")));
            }
        },

        setShowScreenRuler (value) {
			this.settings.showRuler = value;
            this._setStatus("matcSettings",this.settings);
            this.rerender();
		},

        renderScreenButtons (dndDiv, screen) {
            this.logger.log(2,"renderScreenButtons", "enter " +  screen.name, screen.rulers );

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
            if (!this._screenRulerHandles) {
                this._screenRulerHandles = {}
            }
            /**
             * Rulers come unzoomed...
             */
            let z = this.getZoomFactor();
            if (rulers){
                this._cleanUpScreenRulerHandlers(screen.id)
                this._screenRulerHandles[screen.id] = rulers.map(ruler => {

                    let handle = document.createElement("div");		
                    css.add(handle, " MatcScreenGridHandle MatcScreenGridHandle" + ruler.type);
                    dndDiv.appendChild(handle)

                    if (this.settings.showRuler) {
                        let line = document.createElement('div')
                        line.style.backgroundColor = this.model.grid.color
                        css.add(line, "MatcScreenGridLine" + ruler.type);
                        handle.appendChild(line)

                         if (ruler.type === 'y') {
                            line.style.width = screen.w + 'px'
                        } else {
                            line.style.height = screen.h + 'px'
                        }
                    }
                   
                    if (ruler.type === 'y') {
                        handle.style.top = ruler.v * z + 'px'
                    } else {
                        handle.style.left = ruler.v * z + 'px'
                    }
                    if (ruler.inherited) {
                        css.add(handle, "MatcScreenGridHandleDisbaled")
                    } 
                    let listener = on(handle, 'mousedown', lang.hitch(this, '_onScreenRulerHandleDown', screen, ruler, dndDiv, handle))
                    return {
                        rulerId: ruler.id,
                        screenId: screen.id,
                        div: handle,
                        listener: listener
                    }
                })
            }
        },

        _onScreenRulerHandleDown (screen, ruler, dndDiv, handle, e) {
            this.stopEvent(e)
            if (ruler.inherited){
                return;
            }
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
                this._renderRulerLabel(screen, 'y', pos)
            } else {
                handle.style.left = (pos.x - screen.x) + 'px';
                if (pos.x > screen.x && pos.x < (screen.x + screen.w)) {
                    css.remove(handle, 'MatcScreenGridHandleDel')
                } else {
                    css.add(handle, 'MatcScreenGridHandleDel')
                }
                this._renderRulerLabel(screen, 'x', pos)
            }
        },

        _renderRulerLabel (screen, type, pos) {
            if (!this._screenButtonsMoveLabel) {
                var div = document.createElement("div");
                css.add(div, "MatcRulerDimensionLabel");
                this.widgetContainer.appendChild(div);
                this._screenButtonsMoveLabel = div;
            }

            this._screenButtonsMoveLabel.style.left = (pos.x + 10) + "px";
            this._screenButtonsMoveLabel.style.top = (pos.y + 10) + "px";

            if (type === 'x') {
                if (pos.x > screen.x && pos.x < (screen.x + screen.w)) {
                    this._screenButtonsMoveLabel.innerHTML = `left: ${this._getRulerLabel(pos.x - screen.x)} <br> right: ${this._getRulerLabel(screen.x + screen.w - pos.x)} `
                } else {
                    this._screenButtonsMoveLabel.innerHTML = 'Remove'
                }
            } else {
                if (pos.y > screen.y && pos.y < (screen.y + screen.h)) {
                    this._screenButtonsMoveLabel.innerHTML = `top: ${this._getRulerLabel(pos.y - screen.y)} <br> bottom: ${this._getRulerLabel(screen.y + screen.h - pos.y)} `
                } else {
                     this._screenButtonsMoveLabel.innerHTML = 'Remove'
                }
            }
        },

        _getRulerLabel(v) {
		    return Math.ceil(v / this.getZoomFactor());
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
                this._updateInheritedScreenHandlers(screen, ruler)
            }
        },

        _updateInheritedScreenHandlers (screen) {
            /**
             * This method will update all child screens. 
             * ATTENTION: This method depends on the fact, that the
             * controller will inject before a new updated inherited model!
             */
            let childScreens = Core.getChildScreens(this.model, screen)
            if (childScreens) {
                childScreens.forEach(child => {
                      let dndDiv = this.screenDivs[child.id]
                      if (dndDiv) {
                          this._renderScreenRulers(child, child.rulers, dndDiv)
                      }
                })
            }
        },

        _cleanUpScreenRulerHandlers (screenId) {
        
            if (this._screenRulerHandles) {
                if (screenId) {
                    let handlers = this._screenRulerHandles[screenId]
                    if (handlers) {
                        handlers.forEach(h => {
                            h.listener.remove()
                            if (h.div.parentNode) {
                                h.div.parentNode.removeChild(h.div)
                            } else {
                                console.warn('_cleanUpScreenRulerHandlers() > No div', h)
                            }  
                        })
                        delete this._screenRulerHandles[screenId]
                    }
                } else {
                    /**
                     * If we do not have a screen passed, we clean up all keys
                     */
                    Object.keys(this._renderScreenRulers).forEach(key => {
                        this._cleanUpScreenRulerHandlers(key)
                    })
                    this._screenRulerHandles = {}
                }
            }
        },

        _onScreenTopMouseDown (screen, dndDiv, e) {
            this.stopEvent(e)
            this._screenButtonsListenerMove = on(win.body(),"mousemove", lang.hitch(this,"onScreenTopMove", screen, dndDiv));
			this._screenButtonsListenerUp = on(win.body(),"mouseup", lang.hitch(this,"onScreenTopUp", screen, dndDiv));
        },

        onScreenTopMove (screen, dndDiv, e) {
            if (!this._screenButtonMoveLine) {
                this._screenButtonMoveLine = document.createElement('div')
                css.add(this._screenButtonMoveLine, 'MatcScreenGridButtonTopLine')
                this.widgetContainer.appendChild(this._screenButtonMoveLine);
            }
            this.stopEvent(e);
            let pos = this.getCanvasMousePosition(e);
            this._screenButtonMoveLine.style.top = pos.y + 'px';
            this._renderRulerLabel(screen, 'y', pos)
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
                    this._updateInheritedScreenHandlers(screen)
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

        onScreenLeftMove (screen, dndDiv, e) {
            
            if (!this._screenButtonMoveLine) {
                this._screenButtonMoveLine = document.createElement('div')
                css.add(this._screenButtonMoveLine, 'MatcScreenGridButtonLeftLine')
                this.widgetContainer.appendChild(this._screenButtonMoveLine);
            }
            this.stopEvent(e);
            
            let pos = this.getCanvasMousePosition(e);
            this._screenButtonMoveLine.style.left = pos.x + 'px';
            this._renderRulerLabel(screen, 'x', pos)
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
                    this._updateInheritedScreenHandlers(screen)
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
            if (this._screenButtonsMoveLabel) {
                this._screenButtonsMoveLabel.parentNode.removeChild(this._screenButtonsMoveLabel)
            }
            delete this._screenButtonsListenerUp
            delete this._screenButtonsListenerMove
            delete this._screenButtonMoveLine
            delete this._screenButtonsMoveLabel
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