<template>
  <div>
  </div>
</template>
<script>

import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import topic from 'dojo/topic'

export default {
	name: 'ScrollMixin',
    methods: {
        initScroll (){
			/**
			 * Hook in window scroll listener if the simulator is launched in the
			 * mobile.
			 */
			if(!this.scrollListenerInited){
				if(this.scrollListenTarget === "window"){
					this.own(on(window, "scroll", lang.hitch(this, "onScrollWindow")));
				} else if (this.scrollListenTarget === 'simpleBar'){
					// we have to wait for the simple scroll to change the DOM
					setTimeout(() => {
						const parent = this.getSimpleBarScrollParent()
						if (parent) {
							this.logger.log(-1,"initScroll","enter > simpleBar");
							this.own(on(parent, "scroll", lang.hitch(this, "onScrollParent" )));
						} else {
							this.logger.warn("initScroll","enter > could not find simpleBbar");
						}
					}, 300)				
			 	} else {
					if (this.domNode.parentNode) {
						this.own(on(this.domNode.parentNode, "scroll", lang.hitch(this, "onScrollParent" )));
					} else {
						this.logger.warn("initScroll"," no parent");
						return
					}
				}

				this.own(topic.subscribe("VommondScrollContainer", lang.hitch(this,"onVommondScroll")));

				this.scrollListenerInited = true;
				this.logger.log(0,"initScroll","enter >" + this.scrollListenerInited + " @ " +this.scrollListenTarget);
			}
		},

		getSimpleBarScrollParent () {
			const parent = this.domNode?.parentNode?.parentNode
			return parent
		},

		/**********************************************************
		 * Scrolling
		 **********************************************************/
		onVommondScroll (p, scrollTop){
			this.onScroll(scrollTop);
		},

		onScrollWindow (e){
			/**
			 * After scroll animations we do not want to scroll
			 */
			if (this._preventScroll){
				this.stopEvent(e)
				window.scrollTo(0, 0);
				return false;
			}

			const scrollTop = (window.pageYOffset !== undefined)
				? window.pageYOffset
				: (document.documentElement || document.body.parentNode || document.body).scrollTop;

			this.onScroll(scrollTop);
		},

		onScrollParent (e){
			const node = e.target;
			const scrollTop = (node.pageYOffset !== undefined) ? node.pageYOffset : node.scrollTop;
			this.onScroll(scrollTop);
		},

		onScroll (scrollTop){

			const p = (scrollTop / this.currentScreen.h);
			const now = new Date().getTime();
			if(this.logScroll){
				/**
				 * We do not want to record all scroll events. We stick to
				 * every 30ms...
				 */
				const event = {
					time : now,
					value : p
				};
				if(now - this.lastScroll > 30){
					if(this.currentScreen){
						if(!this._scrollEvent){
							this._scrollEvent = {
								time: now,
								children : [],
								type: "scroll"
							}
						}
						this._scrollEvent.children.push(event)
					}
					this.lastScroll = now;

					this._scrollFlushTimeout = setTimeout(lang.hitch(this,"flushScroll", this.currentScreen.id), 530);
				}

				this._lastScrollEvent = event;
				this.currentScrollTop = scrollTop;
				this.currentScrollTopRelative = p;
			}

			this.gestureLastScroll = now;
			topic.publish("MatcSimulatorScrollEvent", p, scrollTop);

			this.fireScrollEvents(scrollTop)
		},


		/**
		 * Check here for all the registered scroll widgets,
		 * if thez are in the view.
		 *
		 * This works currentlz onlz for down scrolls
		 */
		fireScrollEvents (scrollTop) {
			if (this._scrollWidgets && this.currentScreen) {
				let offset = this.currentScreen.y + this.screenPos.h
				for (let i=0; i < this._scrollWidgets.length; i++) {
					let widget = this._scrollWidgets[i].w;
					let line = this._scrollWidgets[i].l
					if (widget.y - offset - 1 < scrollTop) {
						this.preventNextScrolls()
						this.executeLine(this.currentScreen.id, widget.id, line)
						return
					}
				}
			}
		},

		/**
		 * On mobile the scrolls can have to much momentum,
		 * and the screen continues scrolling after the scroll transtion
		 * was fired. we block this for some time.
		 */
		preventNextScrolls () {
			this._preventScroll = true;
			setTimeout (() => {
				this._preventScroll = false
			}, 1000)
		},

		/**
		 * We wait until a scroll is complete, this means after a second.
		 */
		flushScroll (screenID){
			var now = new Date().getTime();
			if(now - this.lastScroll > 250 && this._scrollEvent){
				/**
				 * Add the last event, so we have 4 sure the last scroll position
				 */
				this._scrollEvent.children.push(this._lastScrollEvent)
				this._scrollEvent.value = this._lastScrollEvent.value;

				if(this._scrollEvent.children.length > 0){
					var start = this._scrollEvent.children[0];
					if(start.value > this._lastScrollEvent.value){
						this._scrollEvent.dir ="up";
					} else {
						this._scrollEvent.dir ="down";
					}
				}


				this.log("ScreenScroll", screenID, null, null, this._scrollEvent);
				delete this._scrollEvent;
				delete this._lastScrollEvent;
				delete this._scrollFlushTimeout;
			} else {
//				console.debug("cancelFlush");
			}
		},


		scrollToSamePosition (pos){

			/**
			 * we do not need to do this??
			 * Funny. But log the scroll event
			 */
//			if(this.scrollListenTarget == "window"){
//				window.scrollTo(0, pos);
//			} else {
//				if(this.scrollContainer){
//					this.scrollContainer.setScrollTop(pos);
//				}
//			}
			/**
			 * Log scroll event, so the player moves to the right position.
			 *
			 * FIXME: This causes a small flickering in the
			 * player. We should somehow add the scroll position
			 * to the pageload event?
			 *
			 */
			this.onScroll(pos);
		},

		setScrollContainer (s){
			console.error('DEPCRECATED >>> setScrollContainer()')
			this.scrollContainer = s;
        },

		setScrollListenTarget (hasSimpleBar) {
			if (hasSimpleBar) {
				this.scrollListenTarget = "simpleBar";
			} else {
				this.scrollListenTarget = "parent";
			}
			this.logger.log(-1,"setScrollListenTarget","exit > " + this.scrollListenTarget);
		},

	

		scrollToTop (){
			this.logger.log(1,"scrollToTop","enter > " + this.mode, this.scrollListenTarget);
		
			/**
			 * In 4.2.30: Cleaned this up to be related to scroll target
			 */
			if (this.scrollListenTarget === "window") {
				window.scrollTo(0, 0);
			} 
			if (this.scrollListenTarget === 'parent'){
				this.domNode.parentNode.scrollTop = 0
			}
			if (this.scrollListenTarget === 'simpleBar') {
				const parent = this.getSimpleBarScrollParent()
				if (parent) {
					parent.scrollTop = 0
				} else {
					this.logger.error("scrollToTop","No simple bar");
				}
			}
			// if(this.mode != "debug" && this.mode!= "recordFlow"){
			// 	this.logger.log(-1,"scrollToTop","enter");
			// 	window.scrollTo(0, 0);
			// 	/**
			// 	 * Also set last scroll, so the onScroll() method will
			// 	 * ignore the event from this forced scrolling
			// 	 */
				
			// } else {
			// 	if(this.scrollListenTarget !== "window"){
			// 		this.logger.log(-1,"scrollToTop","enter > parent");
			// 		this.domNode.parentNode.scrollTop = 0
			// 	}
			// }

			/**
			 * Notify the ScrollContainer
			 */
			topic.publish("VommondScrollContainerScrollToTop");
			this.lastScroll = new Date().getTime();
			this.currentScrollTop = 0;
			this.currentScrollTopRelative = 0;
		}
    }
}
</script>