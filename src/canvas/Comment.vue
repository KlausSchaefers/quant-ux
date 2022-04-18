<script>
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import topic from 'dojo/topic'
import win from 'dojo/_base/win'
import DomBuilder from 'common/DomBuilder'
// import CheckBox from 'common/CheckBox'

export default {
    name: 'Comment',
    mixins:[],
    data: function () {
        return {
            showComments: false,
            canDeleteAllComments: true
        }
    },
    components: {},
    methods: {
      initComment (){
				this.logger.log(2,"initComment", "enter");

				/*
				this.commentCheckBox = this.$new(CheckBox);
				this.commentCheckBox.setLabel("Comments");
				this.commentCheckBox.setValue(this.showComments);
				this.commentCheckBox.placeAt(this.commentCntr);
				this.own(on(this.commentCheckBox, "change", lang.hitch(this, "setCommentView")));
				*/
			},

			/**********************************************************************
			 * Comment
			 **********************************************************************/

			setCommentView (value){
				this.logger.log(2,"setCommentView", "enter > "+ value);
				this.showComments = value;
				if(this.showComments){
					this.loadComments()
				} else {
					this.rerender()
				}
			},

			async loadComments (){
				this.logger.log(0,"loadComments", "enter > " + this.model);
				if(this.model && this.model.isTryOut){
					this.onCommentsLoaded([]);
				} else {
					let comments = await this.commentService.find(this.model.id, 'ScreenComment')
					this.onCommentsLoaded(comments)
					//this._doGet("/rest/comments/apps/" + this.model.id +"/ScreenComment.json", lang.hitch(this, "onCommentsLoaded"));
				}
			},

			onCommentsLoaded (temp){
				this.logger.log(0,"onCommentsLoaded", "enter > "+ temp.length);

				/**
				 * This method is called sometimes from the Canvas.setModel() but we do not want do do any thing here
				 */
				this.comments = {};
				for (let i =0; i< temp.length;i++){
					const comment = temp[i];
					this.comments[comment.id] = comment;
				}
				if(this.showComments){
					this.rerender()
				}
			},


			addComment (params){
				this.logger.log(2,"addComment", "enter > ");

				this.setMode("addComment");
				this.setState(3);

				this._createAddCommand("addComment", params);

				var div = this.renderCommentIcon({x:0,y:0});
				this._onAddNDropStart(div, {}, params.event, "onCommentAdded");
			},

			async onCommentAdded (pos, model, e){
				this.logger.log(2,"onCommentAdded", "enter");

				this._onAddDone();
				this.setState(0);
				this.setMode("edit");

				/**
				 * get an increasing number....
				 */
				if(this.model.isTryOut){
					this.showHint("Register to add comments...");
					this._onCommentAdded(pos,e, [] );
				} else {
					let comments = await this.commentService.find(this.model.id, 'ScreenComment')
					this._onCommentAdded(pos, e, comments)
					//this._doGet("/rest/comments/count/apps/" + this.model.id +"/ScreenComment.json", lang.hitch(this, "_onCommentAdded", pos,e));
				}
			},

			_onCommentAdded (pos, e){
				pos = this._addCorrectOffset(pos);
				pos.w = 10;
				pos.h = 10;
			

				let count = 0;
				for (let commentID in this.comments){
					const c = this.comments[commentID];
					count = Math.max(count, c.number);
				}
				count++;

				const screen = this.getHoverScreen(pos);
				if (screen) {
					const x=  (pos.x - screen.x) / screen.w;
					const y=  (pos.y - screen.y) / screen.h;
					const comment = {
						message : "",
						type : "ScreenComment",
						reference : screen.id,
						user : this.user,
						userID : this.user.id,
						created : new Date().getTime(),
						number : count,
						x : x,
						y: y
					};

					this._commentSaveListener = lang.hitch(this, "_onCommentAdded2");

					this.showCommentPopUp(comment, e);

				} else {
					this.showError("Please add the comment to a screen");
				}
			},


			_onCommentAdded2 (){
				//this.commentCheckBox.setValue(true);
				this.onChangeCanvasViewConfig()
				this.setCommentView(true);
			},


			/**********************************************************************
			 * Render
			 *
			 * TODO: We could somehow do this as an decorator... But WTF
			 **********************************************************************/


			renderComments (){

				if (this.showComments && this.comments) {
					this.logger.log(-2,"renderComments", "enter > ");
					this.screenComments = {};
					for(let commentID in this.comments){
						const comment = this.comments[commentID];
						const screenID = comment.reference;
						if (this.model.screens[screenID]) {
							if (this.screenDivs[screenID]) {
								
								if(!this.screenComments[screenID]){
									this.screenComments[screenID] = [];
								}

								const screen = this.model.screens[screenID];
								const box = {
									x : Math.round(screen.x + screen.w * comment.x),
									y : Math.round(screen.y + screen.h * comment.y),
								};
								const div = this.renderCommentIcon(box, comment);
								div._commentID = comment.id
								this.dndContainer.appendChild(div);
								this.screenComments[screenID].push({
									div : div,
									id : comment.id
								});
								//this.registerDragOnDrop(div, comment.id, "onCommentDndStart", "onCommntDndMove", "onCommentDndEnd", "onCommentDndClick");
							} else {
								console.debug("renderComments() > ", screenID, " not rendered...");
							}
						} else {
							console.warn("renderComments() > Comments for non exiting screen ", screenID);
						}
					}

				}
			},

			/**
			 * Wires all comments. Must be separate method as we
			 * rewire shit all the time...
			 */
			wireComments (){
				console.warn('Comment.wireComments() > deprecated')
				try{
					if (this.showComments && this.screenComments){
						this.logger.log(1,"wireComments", "enter > ");
						for (let screenID in this.screenComments){
							const list = this.screenComments[screenID];
							if (list) {
								for(let i=0; i< list.length; i++){
									const item = list[i];
									const comment = this.comments[item.id];
									if (comment) {
										const div = item.div;
										this.registerDragOnDrop(div, comment.id, "onCommentDndStart", "onCommntDndMove", "onCommentDndEnd", "onCommentDndClick");
									}
								}
							}
						}
					}
				} catch (e){
					this.logger.error("wireComments", "enter >Something is wrong ", e);
					this.logger.sendError(e)
				}
			},


			renderCommentIcon (box, ) {
				box.w = this.getZoomed(25, this.zoom);
				box.h = this.getZoomed(25, this.zoom);
				const div = this.createBox(box);
				css.add(div, "MatcCanvasCommentIcon");
				return div;
			},


			onCommentDndStart (){
			},

			onCommntDndMove (){
			},


			onCommentDndEnd (id, div, pos){
				this.logger.log(10, 'onCommentDndEnd', 'enter', 'id', id, div)
				const comment = this.comments[id];
				if(comment){
					const screen = this.model.screens[comment.reference];
					if(screen){
						const x =  (pos.x - screen.x) / screen.w;
						const y =  (pos.y - screen.y) / screen.h;
						comment.x = x;
						comment.y = y;
						this.saveDNDChange(comment);
					} else {
						console.warn("onCommentDndEnd() > no screen with id", comment.reference)
					}
				}
			},

			async saveDNDChange (comment){
				/**
				 * send to server!
				 */
				if(this.isPublic){
					this.showSuccess("Register to comment...");
				} else {
					const comments = await this.commentService.update(this.model.id, comment)
					this.onCommentSaved(comments)
				}
			},

			onCommentDndClick (id, div, pos,e){
				this.stopEvent(e);
				this.onCloseCommentPopup(e);
				const comment = this.comments[id];
				if (comment) {
					this.showCommentPopUp(comment,e);
				}
			},

			showCommentPopUp (comment, e){
				const db  = new DomBuilder();
				const screen = this.model.screens[comment.reference];
				if(screen) {

					const popup = db
						.div("MatcCanvasComment MatcCanvasCommentOpen")
						.build(	this.dndContainer);

					popup.style.top =  Math.round(screen.y + screen.h * comment.y) + "px";
					popup.style.left =  Math.round(screen.x + screen.w * comment.x) + "px";

					this._commentTouchListner = on(popup, "mousedown", e => {
						e.stopPropagation();
					});

					this._commentTouchListner = on(popup, "click", e => {
						e.stopPropagation();
					});

					const cntr = db
						.div("MatcCanvasCommentCntr MatcPadding")
						.build(popup);

					/**
					 * Resize so its always in screen!
					 */
					this._repositionCanvasPopup(popup, e);

					/**
					 * register close on ESC and Canvas clicks
					 */
					this.addSelectionStartListener(lang.hitch(this,"onCloseCommentPopup"));
					this._canvasClickLisenter = topic.subscribe("matc/canvas/click", lang.hitch(this, "onCloseCommentPopup"));
					this.setCanvasCancelCallback("onCloseCommentPopup");
					this.renderCommentPopup(comment, this.user, cntr, db, this.canDeleteAllComments);
					this._commentPopup = popup;
				}

			},

			_repositionCanvasPopup (popup, e){
				const wBox = win.getBox();
				const mPos = this._getMousePosition(e);
				if(mPos.x > wBox.w * 0.7){
					css.add(popup, "MatcCanvasCommentLeft");
				} else {
					css.remove(popup, "MatcCanvasCommentLeft");
				}
				if(mPos.y > wBox.h * 0.7){
					css.add(popup, "MatcCanvasCommentTop");
				} else {
					css.remove(popup, "MatcCanvasCommentTop");
				}
			},



			onCloseCommentPopup (comment,e){
				if (e && e.preventDefault){
					this.stopEvent(e);
				}
				if(this._commentTouchListner){
					this._commentTouchListner.remove();
				}
				if (this._canvasClickLisenter){
					this._canvasClickLisenter.remove();
				}
				if(this._commentPopup && this._commentPopup.parentNode){
					this._commentPopup.parentNode.removeChild(this._commentPopup);
				} else {
					console.debug("onCloseCommentPopup() Connot remove");
				}
				delete this._commentTouchListner;
				delete this._commentPopup;
				delete this._canvasClickLisenter;
				return false;
			},



			async onSaveComment (txt,comment, e){
				this.stopEvent(e);
				comment.message = txt.value;
				if(this.isPublic){
					this.showSuccess("Register to comment...");
				} else {
					if(comment.id){
						const res = await this.commentService.update(this.model.id, comment)
						this.onCommentSaved(res)
					} else {
						const res = await this.commentService.create(this.model.id, comment)
						this.onCommentSaved(res)
					}
				}
				this.stopEvent(e);
				this.onCloseCommentPopup();
			},


			async onDeleteComment (comment, e){
				if (this.isPublic) {
					this.showSuccess("Register to comment...");
				} else {
					if (comment.id) {
						const res = await this.commentService.delete(this.model.id, comment)
						this.onCommentDeleted(res)
					} else {
						this.showSuccess("No Comment was deleted");
					}
				}
				this.stopEvent(e);
				this.onCloseCommentPopup();
			},


			onCommentSaved (data){
				if(data){
					this.showSuccess("Comment updated");
					if (this._commentSaveListener) {
						this._commentSaveListener(data);
						delete this._commentSaveListener;
					}
				}
			},

			onCommentDeleted (data){
				if(data){
					this.showSuccess("Comment deleted");
				}
				this.loadComments();
				this.rerender();
			},

			updateCommentPosition (id, temp){
				if(this.screenComments && this.screenComments[id]){
					const list = this.screenComments[id];
					for(let i=0; i< list.length; i++){
						const item = list[i];
						const comment = this.comments[item.id];
						const box = {
							x : Math.round(temp.x + temp.w * comment.x),
							y : Math.round(temp.y + temp.h * comment.y),
						};
						this.addDragNDropRenderJob({
							div : item.div,
							pos : box,
							id : item.id
						});
					}
				}
			},


			updateCommentDnd (zoomedScreen){
				if(this.screenComments && this.screenComments[zoomedScreen.id]) {
					const list = this.screenComments[zoomedScreen.id];
					for (let i=0; i< list.length; i++){
						const item = list[i];
						const comment = this.comments[item.id];
						const pos = {
							x: Math.round(zoomedScreen.x + zoomedScreen.w * comment.x),
							y: Math.round(zoomedScreen.y + zoomedScreen.h * comment.y),
							w: this.getZoomed(25, this.zoom),
							h: this.getZoomed(25, this.zoom)
						};
						this.domUtil.setBox(item.div, pos)
					}
				}
			},

			cleanUpComments (){
				this.logger.log(2,"cleanUpComments", "enter");
				this.removeScreenCommentIcons()
			},

			removeScreenCommentIcons () {
				if (this.screenComments) {
					for (let screenID in this.screenComments) {
						const list = this.screenComments[screenID]
						list.forEach(c => {
							let div = c.div
							if (div.parentNode) {
								div.parentNode.removeChild(div)
							}
						})
					}
				}
				this.screenComments = {}
			}
    },
    mounted () {
    }
}
</script>