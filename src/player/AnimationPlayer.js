import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import domGeom from 'dojo/domGeom'
import Logger from 'common/Logger'
import Css3Animation from 'core/Css3Animation'
import PlayerFactory from 'player/PlayerFactory'
import CoreUtil from 'core/CoreUtil'

const _playerImportedFonts = {}

export default class AnimationPlayer{

    constructor () {
        this.logger = new Logger("AnimationPlayer");
        this.logger.debugLevel = 1;
        
        this.screenHistory = [];
        this.dataBindingValues = {};
        
        this.renderFactory = new PlayerFactory();
        this.renderFactory.setMode("simulator");
       
        this._animations = {};
        this.animationFactory = new Css3Animation();      
    }

    placeAt (node) {
        this.domNode = document.createElement('div')
        css.add(this.domNode, 'MatcSimulator')
        node.appendChild(this.domNode)
    }

    getScreenDiv () {
        return this.currentScreenDiv;
    }
    
    setModel (model){	
        this.logger.log(1,"setModel","enter >" + model.id + " > splash : "+ this._splashTime);
        this.model = model;
        this.startSimilator(model);
        this.preloadImages()
    }
    
       
    startSimilator (model){
        this.logger.log(2,"startSimilator","enter >" + model.id);
        
        this.initScale();
        
        this.model = CoreUtil.createZoomedModel(this._scaleX, this._scaleY, false, model);
        // does nothing
        //this.model = CoreUtil.addContainerChildrenToModel(this.model);
        
        this.renderFactory.setModel(this.model);
            
        this.renderFactory.setScaleFactor(this._scaleX, this._scaleY);
        
        this.render();
        
        if (this.model.fonts) {
            this.attachFontsToDom(this.model.fonts)
        }
    }

    setScreenPosition (pos) {
        this._externScreenPos = pos
    }
    
    initScale () {
        this.screenPos = domGeom.position(this.domNode.parentNode);
        this._scaleX = (this.screenPos.w / this.model.screenSize.w );
        this._scaleY = this._scaleX;
        this.logger.log(0,"initScale","exit > h:" + this.screenPos.h + " x w:" + this.screenPos.w + " * " + this._scaleX + " > desk : " + this.isDesktopTest);
    }
    
    
    setScreenId (screenID){
        this.logger.log(3,"setScreen","enter >" + screenID);
        var screen = this.model.screens[screenID];
        if(screen){
            this.renderScreen(screen, null);
        } else {
            console.error("No screen with ", screenID);
        }
    }
    
    render () {
        this.logger.log(2,"render","enter >" + this._scaleX + " > " + this._scaleY);
        let start = CoreUtil.getStartScreen(this.model);			
        if(start){
            this.domNode.innerHTML="";
            this.renderScreen(start,0);
        } else {
            this.domNode.innerHTML = "No Start Screen!";
        }
    }
    
    
    /**
     * The default method to show a screen without any animation
     */
    renderScreen (screen, line){
        this.logger.log(-1,"renderScreen","enter > " + screen.id + " / " + screen.name);
        
        try {
            var oldScreen = this.currentScreenDiv;
            
            /**
             * cleanup 
             */
            this.cleanUp();
            
            /**
             * set dom size
             */
            this.setDomSize(screen);
            
            /**
             * render screen and all widgets
             */
            var div = this.createScreen(screen, false);
            
            /**
             * append to DOM without any animation..
             */
            this.addScreen(screen, div, line);
            
            if(oldScreen){
                this.removeScreen(oldScreen);
            } else {
                console.debug("Simualtor.render() > No old screen" );
            }

            this.checkEndScreen(screen);
        } catch (err) {
           console.error(err)
           console.warn("Simualtor.render() >", err.message);
           console.warn(err.stack);
           this.logger.sendError(err);
        }
        
        return div;
    }
    
    
    renderScreenOverlay (overlay, line){
        this.logger.log(3,"renderScreenOverlay","enter > " + overlay.id);
        
        try {
 
            /**
             * set dom size
             */
            this.setDomSize(this.currentScreen, overlay );
            
            /**
             * render screen and all widgets
             */
            var div = this.createScreen(overlay, true);
            
            /**
             * append to dom
             */
            this.addOverlay(overlay, div, line);
            
            this.destroyUiWidgets();

        } catch (err) {
           console.warn("Simualtor.renderScreenOverlay() >", err.message);
           console.debug(err.stack);
           this.logger.sendError(err)
        }
        
        return div;
    }
    
    setDomSize (screen, overlay){
        if (this.domNode) {
            /**
             * set screen position. Make -1 to fix scrolling issues...
             */
            if(!overlay){
                this.domNode.style.height = screen.h + "px";
                this.domNode.style.width = screen.w + "px";
            } else {
                this.domNode.style.height = Math.max(screen.h, overlay.h) + "px";
                this.domNode.style.width  = Math.max(screen.w, overlay.w) + "px";
            }
        }
        this.logger.log(0,"setDomSize","exit > log scroll: " + this.logScroll  + " > h " + screen.h  + " x " + screen.w);
    }
    
    
    /**********************************************************
     * Screen Rendering
     * screen: the screen
     * isOverLay: if the screen is an overlay
     * line: The line that triggered the rendering. Might by null on start!
     * **********************************************************/
    createScreen (screen, isOverlay){
        this.logger.log(2,"createScreen","enter > " + screen.id + " > overlay : " + isOverlay);
        /**
         * Call live cycle methods
         */
        this.beforeScreenCreated(screen, div);
        
        /**
         * create screen box
         */
        var div = document.createElement("div");
        div.style.width = screen.w + "px";
        div.style.height = screen.h + "px";
        div.style.left = "0px";
        div.style.top ="0px";
        
        div.dataScreenId = screen.id;
        css.add(div, "MatcScreen");
        div.setAttribute('screenID', screen.id)
        /**
         * FIXME: Somehow blur the background image too?
         */
        this.renderFactory.setStyle(div, screen);
        
        var screenId = screen.id;
        if(isOverlay){
            div.style.backgroundColor= "transparent";
            screenId = this.currentScreen.id;
        }
            
        /**
         * Now render all widgets in their correct z-value order...
         */
        var widgets = CoreUtil.sortChildren(screen.children, this.model);
        for(var i=0; i< widgets.length; i++){
            var widget = widgets[i];	
            /**
             * we do not render contained widgets! 
             */	
            if (!widget.container){
                this.createWidget(widget, screen, screenId, div);	
            }	
        }	
           
        /**
         * Call live cycle methods
         */
        this.afterScreenCreated(screen, div);

        return div;
    }
    
    beforeScreenCreated () {
        
        if(this._transitionTimer){
            this.logger.log(0,"beforeScreenCreated","Cancel transition timer");
            clearTimeout(this._transitionTimer);
        }
        delete this._transitionTimer;
    }
    
    afterScreenCreated (screen){
        var lines = CoreUtil.getFromLines(screen, this.model);
        if(lines && lines.length > 0){
            var line = this.getLineForGesture(lines, "timer");
            if(line){
                this.logger.log(0,"afterScreenCreated","Found timer");
                var delay = Math.round(line.timer * 1000);
                if(!isNaN(delay) && delay > 0){
                    this._transitionTimer = setTimeout(lang.hitch(this, "executeLine", screen.id, null, line),delay);
                } else {
                    this.logger.error("afterScreenCreated","Delay has shitty format "+ line.timer);
                }	
            }
        }
    }
    
    
    /**********************************************************
     * Widget Stuff
     **********************************************************/

    
    createWidget (widget, screen, screenId, div){
        /**
         * Create the widget container and call render factory
         */
        var w = this.renderWidget(screen, widget);
        div.appendChild(w);

    
        /**
         * For container widgets we wire all the children and add
         * them to the model.
         */
        if (widget.isContainer){
            var uiWidget = this.renderFactory.getUIWidget(widget);
            if (uiWidget){
                let children = uiWidget.getChildren()
                children.forEach(child => {
               
                    /**
                     * Extend here the model with the child elements,
                     * so we can find the widgets later on the event listeners
                     * TODO: Ideally this would be done by the Core.createInheritedModel()
                     * method.
                     */
                    this.model.widgets[child.widget.id] = child.widget
                })
            } else {
                this.log.warn('createWidget', 'Could not find UI widgte for ', widget)
            }
        }
    }

    
    addScreen (screen, div, line){
        /**
         * make sure the mouse events are flushed and correctly associated with an screen!
         */
        var oldScreenDiv = this.currentScreenDiv
        this.lastScreen = this.currentScreen
        this.currentScreen = screen;
        this.currentScreenDiv = div;
        var me = this
        if (this.domNode){
            this.domNode.appendChild(div);
            var scrollPos = this.currentScrollTop;
            /**
             * Line might be null on start!
             */
            if(line && line.scroll){
                this.scrollToSamePosition(scrollPos);
            } else {
                this.scrollToTop();
            }
            this.runOnLoadedScreenAnimation(screen.id, line, function() {
                me.removeScreen(oldScreenDiv)
            });
        }
    }
    
    removeScreen (div){	
        this.logger.log(4, "removeScreen","enter", div);
        if(div && div.parentNode && this.domNode){
            try {
                this.domNode.removeChild(div);
            } catch (e) {
                console.warn("Simulator.removeScreen() > Cannot remove screen", e)
            }				
        }
    }
    
    checkEndScreen (screen){
        if (this.qr === true) {
            if (screen && screen.name && screen.name.indexOf("(END)") > 0){
                this.logger.log(-1, "checkEndScreen","END SCREEN > "+ screen.name);
                this.toggleFullScreen();
            }
        }
    }
    
    addOverlay (overlay, div, line){
        this.currentOverlay = overlay;
        this.currentOverlayDiv = div; 			
        
        this.overlays.push({
            screen : overlay,
            div : div,
            line : line
        });
                    
        if(overlay.style.fixed){

            /**
             * In case if fixed we add an extra screen wrapper, which is fixed,
             * and which will hide the overflow of animations. 
             * 
             * FIXME: This does not work with resize..
             */
            if(!this.fixedOverlayWrapper){
                
                
                this.fixedOverlayWrapper = document.createElement("div");
                this.fixedOverlayWrapper.style.height = this.screenPos.h +"px";
                this.fixedOverlayWrapper.style.width = this.screenPos.w +"px";
                this.fixedOverlayWrapper.style.position = "fixed";
                this.fixedOverlayWrapper.style.overflow = "hidden";
                this.fixedOverlayWrapper.style.top = this.screenPos.y +"px";
                this.fixedOverlayWrapper.style.left = this.screenPos.x +"px";
                //this.fixedOverlayWrapper.style.border ="1px solid orange";
                this.domNode.appendChild(this.fixedOverlayWrapper);
            }
            this.fixedOverlayWrapper.appendChild(div);
            
        } else {
            if(this.currentScreenDiv){
                this.currentScreenDiv.appendChild(div);
            } else {
                console.warn("addOverlay() > NO currentScreenDIV");
            }
        }
        
        
        if(overlay.style.blur && this.currentScreenDiv){
            requestAnimationFrame(lang.hitch(this, "blurBackground", div));
            //this.blurBackground();
        }
        
        this.runOnLoadedScreenAnimation(overlay.id, line);
    }
    
    popOverlay () {

        if(this.overlays && this.overlays.length > 0){
            this.logger.log(1,"popOverlay","enter >");
            
            var overlay = this.overlays.pop();
            if(overlay.line && overlay.line.animation){
                var line = overlay.line;
                
                if(overlay.screen.id != line.to){
                    console.warn("popOverlay() wrong ids between overlay and line??");
                }
                
                            
                var inverse = this.animationFactory.getInverseAnimation(line.animation);
                if(inverse && this.animationFactory["createScreen_"+inverse]){
                    var me = this;
                    var animation = this.animationFactory["createScreen_"+ inverse](overlay.screen, overlay.div,null , true);
                    animation.onEnd(function() {
                    
                        me.removeOverlay(overlay.div);
                       						
                        me.onOverlayPoped();
                    });
                    
                    if(line.duration){
                        animation.setDuration(line.duration);
                    }
                    
                    var easing;
                    if(line.easing){
                        easing = this.animationFactory.getInverseEasing(line.easing);
                        animation.setEasing(easing);
                    }
                    
                    /**
                     * Unblur before
                     */
                    this.unBlurBackground();
                    
                    animation.run();          
                } else {
                    console.warn("popOverlay() > No animation function for : createScreen_"+inverse);
                    this.removeOverlay(overlay.div);
                    this.logHideOverlay(overlay.screen);
                    this.onOverlayPoped();
                }
                
            } else {
                this.removeOverlay(overlay.div, overlay);
                this.logHideOverlay(overlay.screen);
                this.onOverlayPoped();
            }
            
            
            
            return true;
        }
        
        return false;
    }
    
    removeOverlay (div){
        if(div && div.parentNode){
            div.parentNode.removeChild(div);
        }
        
        this.unBlurBackground();     
    }
    
    
    unBlurBackground () {
        if(this.currentScreenDiv){
            var children = this.currentScreenDiv.childNodes;
            for(var i=0; i< children.length; i++){
                var node = children[i];						
                node.style.filter = "none";
                node.style.webkitFilter = "none";	
            }
        }		
    }
    
    blurBackground (div){
        if(this.currentScreenDiv){
            var children = this.currentScreenDiv.childNodes;
            var radius = Math.max(2,20 * this._scaleX);
            for(var i=0; i< children.length; i++){
                var node = children[i];						
                if(node != div){			
                    node.style.filter = "blur(" + radius +"px)";	
                    node.style.webkitFilter = "blur(" + radius +"px)";	
                }				
            }
        }
    }
            
    onOverlayPoped () {

        if(this.overlays.length >0){
            var o = this.overlays[ this.overlays.length-1];
            this.currentOverlay = o.screen;
            this.currentOverlayDiv = o.div; 			
        } else {
            delete this.currentOverlay;
            delete this.currentOverlayDiv;
            
            if(this.fixedOverlayWrapper){
                if(this.domNode) {
                    this.domNode.removeChild(this.fixedOverlayWrapper);
                }
                delete this.fixedOverlayWrapper;
            }
        }
    }
    
    destroyUiWidgets () {
        this.logger.log(3,"destroyUiWidgets","enter");
        this.renderFactory.destroyWidgets();
    }
    
    cleanUp () {
        this.logger.log(2,"cleanUp","enter");
        this.renderFactory.cleanUp();
        this.cleanUpOverlays();
        this.overlays = [];
        delete this.currentOverlay;
        delete this.fixedOverlayWrapper;
        delete this.currentOverlayDiv;
        delete this._scrollWidgets;
    }
    
    cleanUpGestureScreenAnim () {
        
        if(this._screenGestureMoveListener){
            this._screenGestureMoveListener.remove();
            delete this._screenGestureMoveListener;
        }
        if(this._screenGestureMoveListener2){
            this._screenGestureMoveListener2.remove();
            delete this._screenGestureMoveListener2;
        }
        if(this._gesturePressListener){
            this._gesturePressListener.remove();
            delete this._gesturePressListener;
        }
            
        delete this._screenGestureType;
        delete this._screenGestureLine;
        delete this._screenGestureStartScreenID;
        delete this._screenGestureAnim;
    }
    
    
    cleanUpOverlays () {
        if(this.overlays){
            for(var i=0; i< this.overlays.length; i++){
                var o = this.overlays[ this.overlays.length-1];
                var div = o.div;
                this.removeOverlay(div);
            }
        }
        this.overlays = [];
        this.onOverlayPoped();
    }
    
    
    /**
     * Sometimes we want to render as a fixed popup. We have to make sure it
     * has the width of the entire screen as it is position fixed.
     */
    addFixedPopup (node){			
        if(node.parentNode){
            node.parentNode.removeChild(node);
        }		
        node.style.position = "fixed";
        node.style.height = this.screenPos.h +"px";
        node.style.width = this.screenPos.w +"px";
        this.currentScreenDiv.appendChild(node);		
    }
    

   
    /**
     * Return the line with a given type (lines[i].event === type).
     * Handles also old school where there was not event
     */
    getLineForGesture (lines,type ){
        for(var i=0; i< lines.length; i++){
            if(lines[i].event === type || ("click" ===type && !lines[i].event)){
                return lines[i];
            }
        }
    }
    
    executeLine (screenID, widgetID, line){
        if (this.isDestroyed) {
            return;
        }
     
        var screen = this.model.screens[line.to];
        if(screen){				
            /**
             * Store the screen because of onWidgetInit
             */
            this.loadingScreen = screen;
            if(screen.style.overlay){
                this.renderOverlay(line, screenID);
            } else {	
                this.renderTransition(line,screenID);		
            }								
        } else {					
            /**
             * We might have a logic widget in here
             */
            var widget = this.model.widgets[line.to];
            if(widget){
                this.executeLogic(screenID, widgetID, widget, line);						
            } else {
                console.warn("executeLine() > No screen or logic widget with id "+ line.to)
            }					
        }
    }
    
    /**
     * Execute the logic flow. The semantics are the following:
     * 
     * 1) Get all lines in the right order (like they were added)
     * 
     * 2) The *FIRST* line with a rule that matches will be executed
     * 
     * 3) If no line with a rule matches the *FIRST* line will be executed
     */
    executeLogic (screenID, widgetID, widget, orginalLine){
        this.logger.log(1,"executeLogic","enter >  logic:" + widget.id );
    
        /**
         * Get all line sin the correct order
         */
        var lines = this.getFromLines(widget);
        var matchedLine = null;
        if (widget.props && widget.props.isRandom){
            var random = Math.random()
            var pos = Math.floor(random * lines.length);
            this.logger.log(-1,"executeLogic","enter >  do AB:" + widget.id + " >> " + random + " >> " + pos);
            matchedLine = lines[pos]
        } else {
            
            for(var i=0; i< lines.length; i++){
                var line = lines[i];
                if(line.rule){
                    var rule = line.rule;
                    var uiWidget = this.renderFactory.getUIWidgetByID(rule.widget);
                    if(!uiWidget){						
                        var copyId = rule.widget + "@" + screenID;
                        uiWidget = this.renderFactory.getUIWidgetByID(copyId);
                    }		
                    if(uiWidget){	
                        /**
                         * If we have a mathcing rule, we break the loop
                         */
                        if(this.isRuleMatching(rule, uiWidget)){
                            matchedLine = line;
                            break;
                        }						
                    } else {
                        console.warn("executeLogic() > No rule widget with id", line, rule.widget);
                    }
                } else {
                    /**
                     * The *FIRST* line without a condition will be 
                     */
                    if(!matchedLine){
                        matchedLine = line;
                    }
                }
            }
        }
    

        if(matchedLine){
            var screen = this.model.screens[matchedLine.to];
            if(screen){
                
                var newLine = lang.clone(matchedLine);
                newLine.animation = orginalLine.animation;
                newLine.duration = orginalLine.duration;
            
                /**
                 * Store the screen because of onWidgetInit
                 */
                this.loadingScreen = screen;
                if(screen.style.overlay){
                    this.renderOverlay(newLine, screenID);
                } else {
                    this.renderTransition(newLine,screenID);		
                }							
                
            }
        } else {
            console.warn("executeLogic() > Could not match any line");
        }
    }
    
    
    isRuleMatching (rule, uiWidget){
        var value = uiWidget.getValue();
        var valid = uiWidget.isValid(false);
        var result = this.isValueMatchingRule(value, valid, rule);
        this.logger.log(0,"isRuleMatching","enter > " + rule.value + " " + rule.operator + " " + value + " / " + valid + " => " + result);
        return result;
    }
    
    isValueMatchingRule (value, valid, rule) {
        this.logger.log(2,"isValueMatchingRule","enter > " + rule.value + " " + rule.operator + " " + value + " / " + valid);
        
        var operator = rule.operator;
        /**
         * Special handling for checkbox group.
         * We should have an "in" operation
         */
        if (value && Array.isArray(value) && value.length > 0){
            console.debug("Simualtor.isRuleMatching.isArray", value)
            value = value[0]
        }
        
        var result = false;
        switch(operator){
            case "contains":
                if (value.toLowerCase && rule.value.toLowerCase) {
                    var lowerValue = value.toLowerCase();
                    var lowerRule = rule.value.toLowerCase();
                    result = lowerValue.indexOf(lowerRule) >= 0;
                } else {
                    result = false;
                }				
                break;
            case "isValid":
                result = valid;
                break;
            case "checked":
                result = (value === true);
                break;
            case "notchecked":
                result = (value === false);
                break;
                
            case "active":
                result = (value === true);
                break;
            case "notactive":
                result = (value === false);
                break;
            case "==":
                result = (value === rule.value);
                break;
            case "!=":
                result = (value != rule.value);
                break;
            case ">":
                if(!value){
                    value = 0;
                }
                result = (value*1 > rule.value *1);
                break;
            case "<":
                if(!value){
                    value = 0;
                }
                result = (value*1 < rule.value *1);
                break;
            case ">=":
                if(!value){
                    value = 0;
                }
                result = (value*1 >= rule.value *1);
                break;
            case "<=":
                if(!value){
                    value = 0;
                }
                result = (value*1 <= rule.value *1);
                break;
            default:
                console.warn("getRuleLabel() > not supported operator", rule.operator)
        }	
        return result;
    }
    
    
    renderTransition (line, screenID, isGestureAnimation){
        this.logger.log(0,"renderTransition","enter > from " + screenID + " to " + line.to);
        var to = line.to;
        var screen = this.model.screens[to];
    
        if(screen){
            if(line.animation){
                this.logger.log(2,"renderTransition","animate > " + line.animation);
                
                var oldScreenDiv = this.currentScreenDiv;
                this.cleanUp();
                // do we want to do this?
                this.setDomSize(screen);
                
                var newScreenDiv = this.createScreen(screen, false);
                
                /**
                 * If there is an animation init it
                 */
                if(this.animationFactory["createScreen_"+line.animation]){
                    var me = this;
                    var animation = this.animationFactory["createScreen_"+ line.animation](screen, oldScreenDiv, newScreenDiv);
                    animation.onEnd(function() {
                        me.logger.log(-1,"renderTransition","exit > from " + screenID + " to " + line.to);
                        me.removeScreen(oldScreenDiv);
                        me.destroyUiWidgets();
                    });
                    
                    if(line.duration){
                        animation.setDuration(line.duration);
                    }
                    
                    if(line.easing){
                        animation.setEasing(line.easing);
                    }
                
                    if(isGestureAnimation){
                        this.addScreen(screen, newScreenDiv, line);
                        return animation;
                    }
                    animation.run();
                           
                } else {
                    if (line.animation === "transform") {
                        /**
                         * Create a screen transition animation,
                         * but fire only when the screen is loaded in the 
                         * runOnLoadedScreenAnimation() together with 
                         * the other animations! Also log the screen load here!
                         */
                        var anim = this.createScreenTransformAnimation(screen, line);
                        screen._transAnim = anim; 
                        this.removeScreen(oldScreenDiv);       
                    } else {
                        console.warn("renderTransition() > No animation function for : createScreen_"+line.animation);
                    }
                }
                /**
                 * Now hook into dom...
                 */
                this.addScreen(screen, newScreenDiv, line);
            } else {
                /**
                 * default behavior. We remove the screen and render the new one
                 */
                this.logger.log(4,"renderTransition","default");
                this.renderScreen(screen, line);
            }
            
        } else {
            console.error("No screen with ", to);
        }
    }
    
    renderOverlay (line, screenID, isGestureAnimation){
        this.logger.log(2,"renderOverlay","enter > from " + screenID + " to " + line.to);
        var to = line.to;
        var overlay = this.model.screens[to];
        if(overlay){    
            if(line.animation){
                this.logger.log(2,"renderOverlay","animate > " + line.animation);
                
                // var oldScreenDiv = this.currentScreenDiv;
                        
                this.setDomSize(this.currentScreen, overlay);
                
                var newScreenDiv = this.createScreen(overlay, true);
                
                /**
                 * If there is an animation init it
                 */
                if(this.animationFactory["createScreen_"+line.animation]){
                    
                    var animation = this.animationFactory["createScreen_"+ line.animation](overlay, null, newScreenDiv, true);
                    animation.onEnd(lang.hitch(this,"onOverLayLoaded",overlay));
                    
                    if(line.duration){
                        animation.setDuration(line.duration);
                    }
                    
                    if(line.easing){
                        animation.setEasing(line.easing);
                    }
                    
                    if(isGestureAnimation){
                        this.addOverlay(overlay, newScreenDiv, line);
                        return animation;
                    }
                    animation.run();
       
                } else {
                    console.warn("renderOverlay() > No animation function for : createScreen_"+line.animation);
                }
                
                /**
                 * Now hook into dom...
                 */
                this.addOverlay(overlay, newScreenDiv, line);
                
                
            } else {
                /**
                 * default behavior. We remove the screen and render the new one
                 */
                this.logger.log(0,"renderOverlay","default");
                this.renderScreenOverlay(overlay, line);
            }
            
        } else {
            console.error("No screen with ", to);
        }
    }
    
    
    onOverLayLoaded (overlay){
        this.logger.log(2,"onOverLayLoaded","enter > " + overlay.id);  
    }
    
    
    
    /**********************************************************
     * Animation
     **********************************************************/
    
    onAnimation (screenID, widgetID, e) {
        this.logger.log(2,"onAnimation","enter >  sreen:" + screenID + " > widget:" + widgetID + " > taget : " + e.id);
        
        if(this._animations[e.id]){
            this._animations[e.id].stop();
        }

        if (this.isDestroyed) {
            return;
        }
	
        var anim = this.renderFactory.createWidgetAnimation(e);	
        if(anim){
            anim.run()
            anim.onEnd(lang.hitch(this, "onAnimationEnded", e.id));
            this._animations[e.id]  = anim;
        }			
    }
    
    onAnimationEnded (widgetID){
        delete this._animations[widgetID];
    }
    
    
    /**********************************************************
     * Screen Animation!
     **********************************************************/
    
    /**
     * We create here a animation object like it would be in the model,
     * and the call the default runScreenAnimation;
     */
    createScreenTransformAnimation (screen, line) {
        // 
        var animations = {widgets : {}, groups:{}};
        var duration = 250;
        if (line.duration){
            duration = line.duration;
        }
        // var group = {};
        /**
         * Keep somehow in sync with the AnimationComposer.js
         */
        var from = this.currentScreen;
        var widgets = CoreUtil.sortChildren(screen.children, this.model);
        for(var i=0; i< widgets.length; i++){
            var widget = widgets[i];	
            if(!animations.widgets[widget.id]){
                var animation = {duration:duration, delay:0, type: null, easing:line.easing};
                if(this.widgetIsCopyOfOtherScreen(widget, screen.id, from)){
                    animation.type = "transformFromParent";
                    animations.widgets[widget.id] = animation;
                }
            }
                
        }			
        return animations;
    }
    
    
    widgetIsCopyOfOtherScreen (widget, screenID, from) {
        if (from){
            var children = from.children;
            for(var i=0; i< children.length; i++){
                var fromWidget = this.model.widgets[children[i]];
                if (fromWidget.name === widget.name) {
                    widget.animFrom = fromWidget.id;
                    return true;
                }
            }
        }
        return false;
    }
    
    
    runOnLoadedScreenAnimation (screenID,line, endCallback){
        this.logger.log(1,"runOnLoadedScreenAnimation","enter >  sreen:" + screenID);
        if (this.doNotRunOnLoadAnimation){
            this.logger.log(0,"runOnLoadedScreenAnimation","exit because do not run!");
            return;
        }
        var screen = this.model.screens[screenID];

        if(screen){
            var anim = CoreUtil.getScreenAnimation(screen, "ScreenLoaded");
            if (screen._transAnim) {
                /**
                 * If there is an amim, we merge in the transtion stuff, unless
                 * there is already something defined in the animation composer
                 */
                if(anim){
                    var widgetTranAnims = screen._transAnim.widgets;
                    for (var id in widgetTranAnims){
                        if (!anim.widgets[id]){
                            anim.widgets[id] = widgetTranAnims[id]
                        }
                    }
                
                } else {
                    /**
                     * If no anim, but and transition anim,
                     * we take the transition!
                     */
                    anim = screen._transAnim;
                }
                delete screen._transAnim;
            }
            if(anim){
                this.runScreenAnimation(screenID, anim, "ScreenLoaded", endCallback);
            } 
        }
    }

    
    runScreenAnimation (screenID, animation, triggerType, endCallBack, progressCallback){
        this.logger.log(1,"runScreenAnimation","enter >  sreen:" + screenID);
        
        var animFactory = new Css3Animation();
        var anims2Run = [];
        
        
        var widgets = lang.clone(animation.widgets);
        
        /**
         * Here we create a copy of the group animations
         * for every child.
         * 
         * To make slides work, we also calculate the offsets,
         * which will be in the Animation factory method used
         * to correct the *from* position, so the proportions stay the
         * same during the animation.
         */
        var groups = animation.groups;
        if(this.model.groups){
            for(var groupID in groups){
                var groupAnim = groups[groupID];
                var group = this.model.groups[groupID];
                if(group && group.children) {
                    var children = group.children;
                    
                    var bbox = CoreUtil.getGroupBoundingBox(group.children);
                
                    for(var i =0; i< children.length; i++){
                        var widgetID = children[i];
                        var modelWidget = this.model.widgets[widgetID];
                        if(!widgets[widgetID]){
                            var widgetAnim = lang.clone(groupAnim);
                            widgetAnim.offSet = {
                                left: modelWidget.x - bbox.x,
                                top : modelWidget.y - bbox.y,
                                right : (modelWidget.x + modelWidget.w) - (bbox.x + bbox.w),
                                bottom : (modelWidget.y + modelWidget.h) - (bbox.y + bbox.h)
                            }
                            widgets[widgetID] = widgetAnim;
                            
                        } else {
                            console.warn("runScreenAnimation > Group cannot overwrite widget animation for " + widgetID);
                        }
                        
                    }
                } else {
                    // FIXME: this can happen if the group was deleted
                    // We should clean up the animations on widget delete or group delete...
                    console.warn("runScreenAnimation() > No Group with id", groupID)
                }	
            }
        }
        
        
        for(let widgetID in widgets){
            var widgetAnimation = widgets[widgetID];
            
            /**
             * Check if we have an factory method
             */
            if(animFactory["createAnimationEvent_" + widgetAnimation.type]){					
                let animationEvent = animFactory["createAnimationEvent_" + widgetAnimation.type](widgetID, widgetAnimation, this.model, this.lastScreen);
                if(animationEvent){						
                    /**
                     * Like this.renderFactory.createWidgetAnimation(e)
                     */
                    var widget = this.renderFactory.getAnimationWrapper(widgetID);					
                    if(widget){
                        let anim = animFactory.createWidgetAnimation(widget, animationEvent);
                        /**
                         * Save to run later.
                         */
                        if(anim){
                            anims2Run.push(anim);
                        }	
                    } else {
                        console.warn("runScreenAnimation > Not widget for " + widgetID);
                    }						
                }
            } else {
                console.warn("runScreenAnimation > Not supported type " + widgetAnimation);
            }
        }
        
        /**
         * Start the animations only after and have a closure to check
         * if everything is done. Only then invoke callback
         */
        var total = anims2Run.length;
        var done = 0;
        var me = this;
        var checkAllDone = function() {
            done++;
            if(total == done){
                me.cleanUpAnimations();
                if(endCallBack){
                    endCallBack();
                }
            }
        };
        
        /**
         * No run the animations...
         */
        for(let i=0; i < anims2Run.length; i++){
            let anim = anims2Run[i];
            anim.onEnd(checkAllDone);
            if (progressCallback) {
                anim.onStep(progressCallback);
            }
            anim.run();
        } 
        if(total ==0){
            if(endCallBack){
                endCallBack();
            }
        }
        
        this._widgetAnimations = anims2Run;
        
        
    }
    
    /**
     * Log animation events. Pos is relative for correct playback!
     */
    logAnimationEvent (screenID, widgetID, anim, triggerType) {
        
        var event = lang.clone(anim.event);
        event.triggerType = triggerType;
        if(event.to.pos){
            event.to.pos = this.getRelativePosition(event.to.pos);
        }
        if(event.from.pos){
            event.from.pos = this.getRelativePosition(event.from.pos);
        }
    }
    
    getRelativePosition (pos) {
        return {
            x : Math.min(1,Math.round((pos.x / this.currentScreen.w ) * 1000) / 1000),
            y : Math.min(1,Math.round((pos.y / this.currentScreen.h ) * 1000) / 1000),
            w : Math.min(1,Math.round((pos.w / this.currentScreen.w ) * 1000) / 1000),
            h : Math.min(1,Math.round((pos.h / this.currentScreen.h ) * 1000) / 1000)
        };
    }
    
    
    cleanUpAnimations () {
        if(this._widgetAnimations){
            for(var i=0; i < this._widgetAnimations.length; i++){
                //this._widgetAnimations[i].stop();
            }
        }
        delete this._widgetAnimations;
    }
    
    /**********************************************************
     * On Resize
     **********************************************************/
    
    onResize () {
        console.debug("onResize");
    }

    isFixedPosition (widgetID){
        var widget = this.model.widgets[widgetID];
        if(widget && widget.style.fixed){
            return true;
        }
        return false;
    }
    
    isFixedOverlay () {
        if(this.currentOverlay && this.currentOverlay.style.fixed){
            return true;
        }
        return false;
    }
    
    /**********************************************************
     * Helper
     **********************************************************/
    

    renderWidget (screen, widget) {
        var div = this.createBox(widget, screen);
        div.setAttribute('widgetID', widget.id)
        css.add(div, "MatcWidget");		
        this.renderFactory.createWidgetHTML(div, widget);
        return div;
    }
    
    
    createBox (box, parentBox){
        var div = document.createElement("div");
        div.style.width = box.w + "px";
        div.style.height = box.h + "px";
        
        // templated elements have no style...
        var style = CoreUtil.getStyle(box)
        if (!style) {
            style = box.style;
        }
        if(style.fixed){
            /**
             * Read the screen position a every time, because
             * the animation...
             */
            let screen = domGeom.position(this.domNode);
            
            /**
             * A hacky method to allow fixed elements!!!
             */
            div.style.position = "fixed";
            
            /**
             * Here is a bug when we have scrolling... 
             * cannot we add the stupid element to the parent or whatever domnode that does not scroll?
             * No does not work in mobile...
             */
            if(this.screenPos && parentBox){
                div.style.top = (box.y - parentBox.y) + screen.y + "px";
                div.style.left = (box.x - parentBox.x) + screen.x + "px";
            } else {
                console.warn("createBox() > no screenPos or parentBox for fixed box!")
            }
        } else {
            if(parentBox){
                div.style.top = (box.y -parentBox.y) + "px";
                div.style.left = (box.x -parentBox.x) + "px";
            } else {
                console.warn("createBox() > no parent passed!");
            }
        }
        
        return div;
    }
    
    
    scrollToTop () {			
        this.logger.log(-1,"scrollToTop","enter > parent");	
        this.domNode.parentNode.scrollTop = 0
    }
    
    getUUID (prefix){
        return prefix + (new Date().getTime()) + "_"+ Math.round(Math.random() * 10000);
    }

    attachFontsToDom (fonts) {
        if (fonts) {
          let head = document.head || document.getElementsByTagName('head')[0];
          fonts.forEach(f => {        
            if (f) { 
              if (!_playerImportedFonts[f.url]){
                let css = this.getFontImportStatement(f)
                let style = document.createElement('style');
                style.type = 'text/css';
                style.appendChild(document.createTextNode(css));   
                head.appendChild(style);
                _playerImportedFonts[f.url] = true
              }
            }
          })
        }
    }
  
    getFontImportStatement(f) {
        if (f.type !== 'import') {
          return `
            @font-face {
              font-family: "${f.name}";
              src: url("${f.url}") format("${f.type}")
            }`;  
        } else {
          return `@import url('${f.url}');`
        }
    }

    preloadImages () {
        this.logger.log(2,"preloadImages","enter");
        
        var div = document.createElement("div");
        css.add(div, "MatcSimulatorImagePreloader");
        this.domNode.appendChild(div);
        
        for(let id in this.model.screens){
            let box = this.model.screens[id];
            if(box.style && box.style.backgroundImage){
                let img = document.createElement("img");
                img.style.backgroundImage = "url(/rest/images/" + this.hash + "/"  + box.style.backgroundImage.url +")";
                div.appendChild(img);
            }
        }
        
        for(let id in this.model.widgets){
            let box = this.model.widgets[id];
            if(box.style && box.style.backgroundImage){
                let img = document.createElement("img");
                img.style.backgroundImage = "url(/rest/images/" + this.hash + "/"  + box.style.backgroundImage.url +")";
                div.appendChild(img);
            }
        }
        this.logger.log(3,"preloadImages","exit");
    }

      
    destroy () {
        this.logger.log(0,"destroy","enter");
        this.isDestroyed = true;
        this.cleanUpGestureScreenAnim();
        this.cleanUpAnimations();
        window.onscroll =null;
    }
}