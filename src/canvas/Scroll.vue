<script>
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import touch from 'dojo/touch'
import domGeom from 'dojo/domGeom'
import win from 'dojo/_base/win'

export default {
    name: 'Scroll',
    mixins:[],
    data: function () {
        return {

        }
    },
    components: {},
    methods: {
      initScrollBars (){
			this.logger.log(3,"initScrollBars", "entry");

			this.own(on(this.scrollRight, touch.over, lang.hitch(this, "onHoverRight")));
			this.own(on(this.scrollBottom, touch.over, lang.hitch(this, "onHoverBottom")));

			this.own(on(this.scrollRight, touch.press, lang.hitch(this, "onClickRight")));
			this.own(on(this.scrollBottom, touch.press, lang.hitch(this, "onClickBottom")));

			this.own(on(this.scrollRightHandler, touch.press, lang.hitch(this, "onHandlePressRight")));
			this.own(on(this.scrollBottomHandler, touch.press, lang.hitch(this, "onHandlePressBottom")));

			this.domNodePosition = domGeom.position(this.domNode)

			/**
			 * check for resize
			 */
			this.onHoverRight();
			this.onHoverBottom();


			this.logger.log(3,"initScrollBars", "exit");
		},


		updateScrollHandlers (){
			if(!window.requestAnimationFrame){
				console.warn("No requestAnimationFrame()");
				this._updateScrollHandlers();
			} else {
				const callback = lang.hitch(this, "_updateScrollHandlers");
				requestAnimationFrame(callback);
			}
		},

		_updateScrollHandlers () {
				/**
			 * check for resize
			 */
			this.onHoverRight();
			this.onHoverBottom();
		},

		onHoverRight (){
			// this.logger.log(0,"onHoverRight", "entry");

			/**
			 * FIXME: we could speed things up by not taking the position everytime.
			 */

			const pos = this.domNodePosition; //domGeom.position(this.domNode);
			const canPos = this.containerSize //domGeom.position(this.container)

			const totalHeight = canPos.h + pos.h * this.canvasMargin*2;
			const marginY = pos.h * this.canvasMargin - this.canvasPos.y

			this._scrollLastH = pos.h / totalHeight;
			this._scrollLastY = marginY / totalHeight;

			this.scrollRightHandler.style.height = Math.max(10,this._scrollLastH * 100)+ "%";
			this.scrollRightHandler.style.top = Math.max(0,this._scrollLastY * 100)+ "%";

		},

		onHoverBottom (){
		
			const pos = this.domNodePosition // this.domNodePositiondomGeom.position(this.domNode);
			const canPos = this.containerSize //domGeom.position(this.container)

			/**
			 *
			 */
			 const totalWidth = canPos.w + pos.w * this.canvasMargin*2;
			 const marginX = pos.w * this.canvasMargin - this.canvasPos.x

			this._scrollLastW = pos.w / totalWidth;
			this._scrollLastX = marginX / totalWidth;

			this.scrollBottomHandler.style.width = Math.max(10,Math.round((this._scrollLastW) * 100))+ "%";
			this.scrollBottomHandler.style.left = Math.max(0, this._scrollLastX * 100)+ "%";

		},



		/*****************************************************
		 * Right Handlers
		 *****************************************************/


		onClickRight (e){
			//this.logger.log(3,"onClickRight", "entry");

			let p = this.getClickPosition(e);

			/**
			 * check if we clicked left of bar
			 */
			const end = this._scrollLastH + this._scrollLastY;
			if(p.y > end){
				p.y = this._scrollLastY + (p.y - end );
			}

			const pos = domGeom.position(this.domNode);
			const canPos = domGeom.position(this.container)
			const totalHeight = canPos.h + pos.h * this.canvasMargin *2;
			const marginY = pos.h * this.canvasMargin;


			this.setScrollRightPos(p, totalHeight, marginY)
		},

		setScrollRightPos (p, totalHeight, marginY){
			this.scrollRightHandler.style.top = Math.round(p.y *100) + "%";
			this.canvasPos.y = Math.round(totalHeight * p.y - marginY) * -1;
			this.setContainerPos(true);
			this._scrollLastY = p.y;
		},

		onHandlePressRight (e){
			//this.logger.log(3,"onHandlePressRight", "entry");

			this.stopEvent(e);
			this.scrollCleanUp();

			const pos = domGeom.position(this.domNode);
			const canPos = domGeom.position(this.container)

			const totalHeight = canPos.h + pos.h * this.canvasMargin * 2;
			const marginY = pos.h * this.canvasMargin;

			this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"oHandleMoveRight", pos, totalHeight, marginY));
			this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"onHandleRelease"));
			this._scrollStartPos = this.getClickPosition(e);
			this._scrollOffSetY = this._scrollStartPos.y - this._scrollLastY;
			css.add(this.scrollRight, "MatcCanvasScrollBarHandlerActive");
		},

		oHandleMoveRight ( pos, totalHeight, marginY, e){
			this.stopEvent(e);
			pos = this.getClickPosition(e);
			var p = {
				x : this._scrollStartPos.x + (pos.x - this._scrollStartPos.x),
				y : this._scrollStartPos.y + (pos.y - this._scrollStartPos.y) - this._scrollOffSetY,
			}
			this.setScrollRightPos(p, totalHeight, marginY);
		},


		/*****************************************************
		 * Bottom Handlers
		 *****************************************************/


		onClickBottom (e){
			//this.logger.log(3,"onClickBottom", "entry");

			let p = this.getClickPosition(e);

			/**
			 * check if we clicked left of bar
			 */
			const end = this._scrollLastW + this._scrollLastX;
			if(p.x > end){
				p.x = this._scrollLastX + (p.x - end );
			}

			const pos = domGeom.position(this.domNode);
			const canPos = domGeom.position(this.container)
			const totalWidth = canPos.w + pos.w * this.canvasMargin * 2;
			const marginX = pos.w * this.canvasMargin;

			this.setScrollBottom(p,totalWidth, marginX);
		},

		setScrollBottom (p, totalWidth, marginX){
			this.scrollBottomHandler.style.left = Math.round(p.x *100) + "%";
			this.canvasPos.x = Math.round(totalWidth * p.x - marginX) * -1;
			this._scrollLastX = p.x;
			this.setContainerPos(true);
		},


		onHandlePressBottom (e){
			//this.logger.log(3,"onHandlePressBottom", "entry");

			this.stopEvent(e);
			this.scrollCleanUp();

			const pos = domGeom.position(this.domNode);
			const canPos = domGeom.position(this.container)

			const totalWidth = canPos.w + pos.w * this.canvasMargin * 2;
			const marginX = pos.w * this.canvasMargin;

			this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"oHandleMoveBottom", pos, totalWidth, marginX));
			this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"onHandleRelease"));
			this._scrollStartPos = this.getClickPosition(e);
			this._scrollOffSetX = this._scrollStartPos.x - this._scrollLastX;
			css.add(this.scrollBottom, "MatcCanvasScrollBarHandlerActive");
		},

		oHandleMoveBottom (pos, totalWidth, marginX, e){
			this.stopEvent(e);
			pos = this.getClickPosition(e);
			const p = {
				x : this._scrollStartPos.x + (pos.x - this._scrollStartPos.x) - this._scrollOffSetX,
				y : this._scrollStartPos.y + (pos.y - this._scrollStartPos.y),
			}
			this.setScrollBottom(p, totalWidth, marginX);
		},

		onHandleRelease (e){
			this.stopEvent(e);
			this.scrollCleanUp();
		},

		getClickPosition (e){
			this.stopEvent(e);
			const mPos = this._getMousePosition(e);
			const posX = domGeom.position(this.scrollBottomCntr);
			const posY = domGeom.position(this.scrollRightCntr);
			const difY = mPos.y - posY.y;
			const difX = mPos.x - posX.x;
			const p = {
				y :  difY / posY.h,
				x :  difX / posX.w
			};
			return p;
		},

		scrollCleanUp (){
			if(this._touchMoveListner){
				this._touchMoveListner.remove();
			}
			if(this._touchReleaseListner){
				this._touchReleaseListner.remove();
			}
			delete this._touchReleaseListner;
			delete this._touchMoveListner;
			delete this._scrollStartPos;
			delete this._scrollOffSetY;
			delete this._scrollOffSetX;
			css.remove(this.scrollRight, "MatcCanvasScrollBarHandlerActive");
			css.remove(this.scrollBottom, "MatcCanvasScrollBarHandlerActive");
		}
    },
    mounted () {
    }
}
</script>