<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import win from 'dojo/_base/win'
import Core from 'core/Core'

import ModelResizer from 'core/ModelResizer'

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

        },

        setShowScreenRuler (value) {
			this.settings.showRuler = value;
            this._setStatus("matcSettings",this.settings);
            this.rerender();
		},

        renderScreenButtons (dndDiv, screen) {
            this.logger.log(1,"renderScreenButtons", "enter " +  screen.name, screen.rulers );

            if (!this._screenButtonsListeners) {
                this._screenButtonsListeners = []
            }

           	let top = document.createElement("div");
            top._screenRulerTop = screen.id
            css.add(top, "MatcScreenGridButtonTop");
            dndDiv.appendChild(top)

            let left = document.createElement("div");
            left._screenRulerLeft = screen.id
            css.add(left, "MatcScreenGridButtonLeft");
            dndDiv.appendChild(left)

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
            this._screenButtonsListenerMoveStart = new Date().getTime()
            if (ruler.inherited){
                return;
            }
            this._screenButtonsListenerMove = on(win.body(),"mousemove", lang.hitch(this,"_onScreenRulerHandleMove", screen, ruler, dndDiv, handle));
			this._screenButtonsListenerUp = on(win.body(),"mouseup", lang.hitch(this,"_onScreenRulerHandleUp", screen, ruler, dndDiv, handle));
        },

        _onScreenRulerHandleMove (screen, ruler, dndDiv, handle, e) {
            this.stopEvent(e)
            this.unSelect()
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
            if (ruler.props && ruler.props.sticky) {
                let z = this.getZoomFactor();
                let oldV = ruler.v * z
                let positions = ModelResizer.getRulerMoveUpdates(this.model, screen, ruler, oldV, this._getRulerValue(screen, ruler, pos))
                // console.debug('_onScreenRulerHandleMove', positions)
                this._resizeRenderJobs = {}
                for (let id in positions) {
                    let newPos = positions[id]
                    let div = this.widgetDivs[id];
                    if (div) {
                        this._resizeRenderJobs[id] = {
                            "pos" : newPos,
                            "div" : div
                        };
                    }
                }
                var callback = lang.hitch(this, "_resizeDndUpDateUI");
                requestAnimationFrame(callback);
            }
        },

        _getRulerValue (screen, ruler, pos) {
            if (ruler.type === 'y') {
                return pos.y - screen.y
            } else {
                return pos.x - screen.x
            }
        },

        _renderRulerLabel (screen, type, pos) {
            if (!this._screenButtonsMoveLabel) {
                var div = document.createElement("div");
                css.add(div, "MatcRulerDimensionLabel");
                this.dndContainer.appendChild(div);
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

            let now = new Date().getTime()
            let dif = (now - this._screenButtonsListenerMoveStart)
            this.cleanUpScreenButtonMove()
            /**
             * Check if we had a click
             */
            if (dif < 300) {
                if (this.controller) {
                    this.unSelect()
                    this.controller.onRulerSelected(screen.id, ruler.id)
                }
                return;
            }

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
                if (this.controller) {
                    this.unSelect()
                    this.controller.onRulerSelected(screen.id, ruler.id)
                }
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

        _onScreenTopMouseDown (screenId, e) {
            this.stopEvent(e)
            let screen = this.model.screens[screenId]
            let dndDiv = this.screenDivs[screenId]
            if (screen && dndDiv) {
                this._screenButtonsListenerMove = on(win.body(),"mousemove", lang.hitch(this,"onScreenTopMove", screen, dndDiv));
			    this._screenButtonsListenerUp = on(win.body(),"mouseup", lang.hitch(this,"onScreenTopUp", screen, dndDiv));
            } else {
                this.logger.warn('_onScreenTopMouseDown', 'No screen or DND')
            }
        },

        onScreenTopMove (screen, dndDiv, e) {
            if (!this._screenButtonMoveLine) {
                this._screenButtonMoveLine = document.createElement('div')
                css.add(this._screenButtonMoveLine, 'MatcScreenGridButtonTopLine')
                this.dndContainer.appendChild(this._screenButtonMoveLine);
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

        _onScreenLeftMouseDown (screenId, e) {
            this.stopEvent(e)
            let screen = this.model.screens[screenId]
            let dndDiv = this.screenDivs[screenId]
            if (screen && dndDiv) {
                this._screenButtonsListenerMove = on(win.body(),"mousemove", lang.hitch(this,"onScreenLeftMove", screen, dndDiv));
			    this._screenButtonsListenerUp = on(win.body(),"mouseup", lang.hitch(this,"onScreenLeftUp", screen, dndDiv));
            } else {
                this.logger.warn('_onScreenLeftMouseDown', 'No screen or DND')
            }
        },

        onScreenLeftMove (screen, dndDiv, e) {

            if (!this._screenButtonMoveLine) {
                this._screenButtonMoveLine = document.createElement('div')
                css.add(this._screenButtonMoveLine, 'MatcScreenGridButtonLeftLine')
                this.dndContainer.appendChild(this._screenButtonMoveLine);
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
            this.logger.log(3, "cleanUpScreenButtonMove", "enter");
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
            delete this._screenButtonsListenerMoveStart
        },

        cleanUpScreenButtons () {
            this.logger.log(3,"cleanUpScreenButtons", "enter");
            this.cleanUpScreenButtonMove()
            this._cleanUpScreenRulerHandlers()
            if (this._screenButtonsListeners){
                this._screenButtonsListeners.forEach(listener => {
                    listener.remove()
                })
            }
            delete this._screenButtonsListeners
        }

    }
}
</script>