<script>
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import topic from 'dojo/topic'
import win from 'dojo/_base/win'
import DomBuilder from 'common/DomBuilder'
import CanvasCommet from '../page/CanvasComment'
// import CheckBox from 'common/CheckBox'

export default {
	name: 'Comment',
	mixins: [],
	data: function () {
		return {
			showComments: true,
			commentSize: 25,
			commentFontSize: 10,
			canDeleteAllComments: true
		}
	},
	components: {},
	methods: {
		initComment() {
			this.logger.log(2, "initComment", "enter");
		},

		/**********************************************************************
		 * Comment
		 **********************************************************************/

		setCommentView(value) {
			this.logger.log(2, "setCommentView", "enter > " + value);
			this.showComments = value;
			if (this.showComments) {
				this.loadComments()
			} else {
				this.rerender()
			}
		},

		async loadComments() {
			this.logger.log(1, "loadComments", "enter > ", this.model);
			if (!this.model) {
				console.error("loadComments() > no model")
				//console.trace()
				return
			}
			if (this.model.isTryOut) {
				this.onCommentsLoaded([]);
			} else {		
				let comments = await this.commentService.find(this.model.id, 'ScreenComment')	
				this.onCommentsLoaded(comments)
			}
		},

		onCommentsLoaded(temp) {
			this.logger.log(0, "onCommentsLoaded", "enter > " + temp.length);

			/**
			 * This method is called sometimes from the Canvas.setModel() but we do not want do do any thing here
			 */
			this.comments = {};
			for (let i = 0; i < temp.length; i++) {
				const comment = temp[i];
				this.comments[comment.id] = comment;
			}
			if (this.showComments) {
				this.rerender()
			}
		},


		addComment(params) {
			this.logger.log(2, "addComment", "enter > ");

			this.setMode("addComment");
			this.setState(3);

			this._createAddCommand("addComment", params);

			var div = this.renderCommentIcon({ x: 0, y: 0 });
			this._onAddNDropStart(div, {}, params.event, "onCommentAdded");
		},

		async onCommentAdded(pos, model, e) {
			this.logger.log(-2, "onCommentAdded", "enter");

			this._onAddDone();
			this.setState(0);
			this.setMode("edit");

			/**
			 * get an increasing number....
			 */
			if (this.model.isTryOut) {
				this.showHint("Register to add comments...");
				this._onCommentAdded(pos, e, []);
			} else {				
				this._onCommentAdded(pos, e)
			}
		},

		_onCommentAdded(pos, e) {
			this.logger.log(-2, "_onCommentAdded", "enter");

			pos = this.getUnZoomedBox(pos, this.zoom, this.zoom);
			pos = this._addCorrectOffset(pos);
			pos.w = 10;
			pos.h = 10;

			let count = 0;
			for (let commentID in this.comments) {
				const c = this.comments[commentID];
				count = Math.max(count, c.number);
			}
			count++;
			const x = pos.x;
			const y = pos.y
			const comment = {
				message: "",
				reference:"canvas",
				type: "ScreenComment",
				user: {
					"_id" : this.user.id,
					"email" : this.user.email,
					"name" : this.user.name,
					"lastname" : this.user.lastname,
					"image" :  this.user.image,
					"id" : this.user.id
				},
				userID: this.user.id,
				created: new Date().getTime(),
				number: count,
				x: x,
				y: y
			};
			this._commentSaveListener = lang.hitch(this, "_onCommentAdded2");
			this.showCommentPopUp(comment, e, true);		
		},


		_onCommentAdded2() {
			this.onChangeCanvasViewConfig()
			this.setCommentView(true);
		},


		/**********************************************************************
		 * Render
		 *
		 * TODO: We could somehow do this as an decorator... But WTF
		 **********************************************************************/

		renderComments() {

			if (this.showComments && this.comments) {
				this.logger.log(2, "renderComments", "enter > ");
				this.screenComments = {};
				this.commentDivs = {}
			
				const comments = Object.values(this.comments).filter(c => !c.parentId)

				for (let commentID in comments) {
					const comment = comments[commentID];
		
					const screenID = comment.reference;
					if (this.model.screens[screenID]) {
						if (this.screenDivs[screenID]) {

							if (!this.screenComments[screenID]) {
								this.screenComments[screenID] = [];
							}

							const screen = this.model.screens[screenID];
							const box = {
								x: Math.round(screen.x + screen.w * comment.x),
								y: Math.round(screen.y + screen.h * comment.y),
							};
							const div = this.renderCommentIcon(box, comment);
							if (comment.id) {
								this.commentDivs[comment.id] = div
								div._commentID = comment.id
							}
							this.dndContainer.appendChild(div);
							this.screenComments[screenID].push({
								div: div,
								id: comment.id
							});
							//this.registerDragOnDrop(div, comment.id, "onCommentDndStart", "onCommntDndMove", "onCommentDndEnd", "onCommentDndClick");
						} else {
							console.debug("renderComments() > ", screenID, " not rendered...");
						}
					} else {
						
						if (!this.screenComments["canvas"]) {
							this.screenComments["canvas"] = [];
						}

						let box = {
							x: comment.x,
							y: comment.y,
						};

						box = this.getZoomedBox(box, this.zoom, this.zoom);
						const div = this.renderCommentIcon(box, comment);
						if (comment.id) {
							this.commentDivs[comment.id] = div
							div._commentID = comment.id
						}
					
						this.dndContainer.appendChild(div);
						this.screenComments["canvas"].push({
							div: div,
							id: comment.id
						});

					}

				}

			}
		},

		updateCommentPositions () {
			if (this.showComments && this.comments) {
				this.logger.log(2, "updateCommentPositions", "enter > ");

				if (this._commentWidget) {
					this.onCloseCommentPopup()
				}
			
				const canvasComments = this.screenComments["canvas"]
				if (canvasComments) {
					const id2Div = {}
					canvasComments.forEach(pair => {
						id2Div[pair.id] = pair.div
					})

					const w = Math.min(this.commentSize, this.getZoomed(this.commentSize, this.zoom))
					for (let commentID in this.comments) {
						const comment = this.comments[commentID];		
						const div = id2Div[comment.id] 
						if (div) {
							let box = {
								x: comment.x,
								y: comment.y,
								w: w,
								h: w
							};
							div.style.fontSize = this.getZoomed(this.commentFontSize, this.zoom) + 'px'
							box = this.getZoomedBox(box, this.zoom, this.zoom);
							this.domUtil.setBox(div, box)
						}
					}
				}
			}
		},

		renderCommentIcon(box, comment = {}) {
			
			box.w = Math.min(this.commentSize, this.getZoomed(this.commentSize, this.zoom));
			box.h = Math.min(this.commentSize, this.getZoomed(this.commentSize, this.zoom))
			const div = this.createBox(box);
			css.add(div, "MatcCanvasCommentIcon " + comment.status);
			div.style.fontSize = this.getZoomed(this.commentFontSize, this.zoom) + 'px'

			if (comment.id) {

				const letters = document.createElement('div')
				css.add(letters, "MatcCanvasCommentLetters")
				letters._commentID = comment.id
				letters.innerText = this.getUserLetter(comment.user)
				div.appendChild(letters)

				const content = document.createElement('div')
				css.add(content, "MatcCanvasCommentPreview")

				const message = document.createElement('div')
				css.add(message, "MatcCanvasCommentMessage")
				message.innerText = comment.message
				message._commentID = comment.id
				content.append(message)
	
				const footer = document.createElement('div')
				css.add(footer, "MatcCanvasCommentFooter")
				footer._commentID = comment.id
			
				const user = document.createElement('div')
				css.add(user, "MatcCanvasCommentUser")
				user.innerText = this.getUserName(comment.user)
				user._commentID = comment.id
				footer.appendChild(user)

				const footerDetails = document.createElement('div')
				css.add(footerDetails, "MatcCanvasCommentFooterDetails")
				footerDetails._commentID = comment.id
				footer.appendChild(footerDetails)

				const date = document.createElement('div')
				css.add(date, "MatcCanvasCommentDate")
				date.innerText = this.formatDate(comment.created)
				date._commentID = comment.id
				footerDetails.appendChild(date)


				const children = Object.values(this.comments)
					.filter(c => c.parentId === comment.id)

				if (children.length > 0) {
					const childCount = document.createElement('div')
					css.add(childCount, "MatcCanvasCommentDate")
					childCount.innerText = children.length + ' Replies'
					childCount._commentID = comment.id
					footerDetails.appendChild(childCount)
				}
	
			
				content.append(footer)


				content._commentID = comment.id
				div.appendChild(content)

			}


			return div;
		},

		updateCommentIcon (comment) {

			const div = this.commentDivs[comment.id]
			if (div) {
				if (div.parentNode) {
					div.parentNode.removeChild(div)
				}
			}
			let box = {
				x: comment.x,
				y: comment.y,
			}
			box = this.getZoomedBox(box, this.zoom, this.zoom);
			const newDiv = this.renderCommentIcon(box, comment)
			this.dndContainer.appendChild(newDiv);
			this.commentDivs[comment.id] = newDiv

			this.screenComments["canvas"] = this.screenComments["canvas"].filter(c => c.id != comment.id)
			this.screenComments["canvas"].push({
				div: newDiv,
				id: comment.id
			})
		},

		onCommentDndStart() {
		},

		onCommntDndMove() {
		},


		onCommentDndEnd(id, div, pos) {
			if (isNaN(pos.x)) {
				return
			}
			this.logger.log(10, 'onCommentDndEnd', 'enter', 'id', id, div)
			const comment = this.comments[id];
			if (comment) {			
				pos = this.getUnZoomedBox(pos, this.zoom, this.zoom);
				const x = pos.x
				const y = pos.y
				comment.x = x;
				comment.y = y;
				// this will break old commments
				comment.reference = 'canvas'
				this.saveDNDChange(comment);				
			}
		},

		async saveDNDChange(comment) {
			/**
			 * send to server!
			 */
			if (this.isPublic) {
				this.showSuccess("Register to comment...");
			} else {
				const comments = await this.commentService.update(this.model.id, comment)
				this.onCommentSaved(comments)
			}
		},

		onCommentDndClick(id, div, pos, e) {
			this.stopEvent(e);
			this.onCloseCommentPopup(e);
			const comment = this.comments[id];
			if (comment) {
				this._commentSaveListener =  () => {			
					this.loadComments()
				}
				this.showCommentPopUp(comment, e);
			}
		},

		showCommentPopUp(comment, e, isNew = false) {
			const db = new DomBuilder();

			if (this._commentWidget) {
				this.onCloseCommentPopup()
			}

			const popup = db
				.div("MatcCanvasComment MatcCanvasCommentOpen")
				.build(this.dndContainer);

			/**
			 * Resize so its always in screen!
			 */
			this._repositionCanvasPopup(popup, e);

			/**
			 * register close on ESC and Canvas clicks
			 */
			this.addSelectionStartListener(() => this.onCloseCommentPopup());
			this._canvasClickLisenter = topic.subscribe("matc/canvas/click", () => this.onCloseCommentPopup());
			this.setCanvasCancelCallback("onCloseCommentPopup");

			const children = Object.values(this.comments)
				.filter(c => c.parentId === comment.id && !isNew)

			const widget = this.$new(CanvasCommet)
			widget.placeAt(popup)
			widget.setValue(comment, children)
			widget.setUser(this.user)
			widget.on("save", (c, isChild) => {
				this.onSaveComment(c, isChild)
			})
			widget.on("delete", (c, isChild) => {
				this.onDeleteComment(c, isChild)
			})
			widget.on("next", (i, e) => {
				this.showNextComment(comment, i, e)
			})
			widget.on("cancel", () => this.onCloseCommentPopup())

			this._commentPopup = popup;
			this._commentWidget = widget
					
			const screen = this.model.screens[comment.reference];
			if (screen) {
				popup.style.top = Math.round(screen.y + screen.h * comment.y) + "px";
				popup.style.left = Math.round(screen.x + screen.w * comment.x) + "px";				
			} else {
				let box = {
					x: comment.x + 32,
					y: comment.y
				};
				box = this.getZoomedBox(box, this.zoom, this.zoom);
				popup.style.top = Math.round(box.y) + "px";
				popup.style.left = Math.round(box.x) + "px";		
			}

		},

		showNextComment (comment, i, e) {		
			const list = Object.values(this.comments).filter(c => !c.parentId)
			const index = list.findIndex(c => c.id === comment.id)
			if (index >= 0) {		
				const nextIndex = (index + i + list.length) % list.length
				const nextComment = list[nextIndex]
				if (nextComment.reference !== 'canvas') {
					this.moveToScreen(nextComment.reference, true)
				} else {
					const box = {
						x: this.getZoomed(nextComment.x, this.zoom),
						y: this.getZoomed(nextComment.y, this.zoom),
					}
					this.moveToBox(box, true)
				}
				this.showCommentPopUp(nextComment, e)
			}
		},

		_repositionCanvasPopup(popup, e) {
			const wBox = win.getBox();
			const mPos = this._getMousePosition(e);
			if (mPos.x > wBox.w * 0.7) {
				css.add(popup, "MatcCanvasCommentLeft");
			} else {
				css.remove(popup, "MatcCanvasCommentLeft");
			}
			if (mPos.y > wBox.h * 0.7) {
				css.add(popup, "MatcCanvasCommentTop");
			} else {
				css.remove(popup, "MatcCanvasCommentTop");
			}
		},


		onCloseCommentPopup(comment, e) {
			if (e && e.preventDefault) {
				this.stopEvent(e);
			}
			if (this._commentWidget) {
				this._commentWidget.destroy()
			}
			if (this._commentTouchListner) {
				this._commentTouchListner.remove();
			}
			if (this._canvasClickLisenter) {
				this._canvasClickLisenter.remove();
			}
			if (this._commentPopup && this._commentPopup.parentNode) {
				this._commentPopup.parentNode.removeChild(this._commentPopup);
			} else {
				console.debug("onCloseCommentPopup() Cannot remove");
			}
			delete this._commentTouchListner;
			delete this._commentPopup;
			delete this._canvasClickLisenter;
			delete this._commentWidget;
			return false;
		},



		async onSaveComment(comment, isChild=false) {
			//console.debug('onSaveComment', comment.id, comment.message, comment.parentId, isChild)
			if (this.isPublic) {
				this.showSuccess("Register to comment...");
			} else {
				if (comment.id) {
					const old = this.comments[comment.id];
					old.message = comment.message
					old.status = comment.status
					old.modified = new Date().getTime()
					old.edited = true
					const res = await this.commentService.update(this.model.id, old)
					this.updateCommentIcon(old)
					this.onCommentSaved(res)		
				} else {
					const res = await this.commentService.create(this.model.id, comment)			
					this.onCommentSaved(res)					
				}
			}
			if (!isChild) {
				this.onCloseCommentPopup();
			}
	
		},


		async onDeleteComment(comment, isChild = false) {
			//console.debug('onDeleteComment', comment.id, comment.message, comment.parentId, isChild)
			if (this.isPublic) {
				this.showSuccess("Register to comment...");
			} else {
				if (comment.id) {
					const res = await this.commentService.delete(this.model.id, comment)
					this.onCommentDeleted(res)
		
					// delete also all children
					const children = Object.values(this.comments)
						.filter(c => c.parentId === comment.id)
					this.logger.log(-1, "onDeleteComment", "Children " + children.length);
					children.forEach(child => {
						this.commentService.delete(this.model.id, child)
						delete this.comments[child.id]
					})

				} else {
					this.showSuccess("No Comment was deleted");
				}
			}			
			if (!isChild) {
				this.onCloseCommentPopup();
			}	
		},


		onCommentSaved(data) {
			if (data) {
				this.showSuccess("Comment updated");
				if (this._commentSaveListener) {
					this._commentSaveListener(data);
					delete this._commentSaveListener;
				}
			}
		},

		onCommentDeleted(data) {
			if (data) {
				this.showSuccess("Comment deleted");
			}
			this.loadComments();
			this.rerender();
		},

		updateCommentDnd(zoomedScreen) {
			if (this.screenComments && this.screenComments[zoomedScreen.id]) {
				const list = this.screenComments[zoomedScreen.id];
				for (let i = 0; i < list.length; i++) {
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

		cleanUpComments() {
			this.logger.log(2, "cleanUpComments", "enter");
			this.removeScreenCommentIcons()
		},

		removeScreenCommentIcons() {
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
	mounted() {
	}
}
</script>