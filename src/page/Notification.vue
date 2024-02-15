
<template>
     <div class="MatcHidden MatcToolbarItem MatcNotification MatcToolbarDropDownButton">
		<div type="button" ref="button">
			<span class="mdi mdi-bell"></span>
		</div>
		<div class="MatcToolbarPopUp MatcNotificationPopup" role="menu" data-dojo-attach-point="popup">
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import _DropDown from './_DropDown'
import DomBuilder from 'common/DomBuilder'
import Dialog from 'common/Dialog'
import Services from 'services/Services'

export default {
    name: 'Notification',
    mixins:[DojoWidget, _DropDown],
    data: function () {
        return {
            section: "",
            reposition: false,
            arrowPosition: 0
        }
    },
    components: {},
    methods: {
      postCreate: function(){
				this.own(on(this.domNode, touch.press, lang.hitch(this, "showDropDown")));
				this.logger = new Logger("Notification");
				setTimeout(lang.hitch(this, "loadNotifications"), 30);
			},

			init (){
				this.logger.log(1, "init", "enter")
			},

			async loadNotifications (){
				let result = await Services.getUserService().getNotications()
				this.setNotifications(result)
			},

			setNotifications (notifications){
				if (notifications.length > 0){
					this.renderNotifications(notifications);
					css.remove(this.domNode, "MatcHidden");
				}
			},

			async renderNotifications  (notifications){
				this.logger.log(3, "renderNotifications", "enter");
				var db = new DomBuilder()

				notifications.sort(function(a,b) {
					return b.lastUpdate - a.lastUpdate;
				});

				/**
				 * TODO: Filter by category...
				 */

				var lastNoticationView = await this.getLastView();
				var newNotifications = 0;
				var cntr = db.div().build();
				for(var i=0; i < Math.min(notifications.length, 10); i++ ){
					var notification = notifications[i];
					var item = db.div("MatcNotificationItem").build(cntr)
					db.label("MatcNotificationItemTitle", notification.title).build(item);
					if (notification.message) {
						var msg = db.p("MatcNotificationItemMessage", notification.message).build(item);

						if (notification.more){
							css.add(item, "MatcNotificationItemClickable");
							db.a("", " " + this.getNLS("notification.more")).build(msg)
							this.tempOwn(on(item, "click", lang.hitch(this, "runMore", notification)));
						} else if (notification.link){
							css.add(item, "MatcNotificationItemClickable");
							db.a("", " " + this.getNLS("notification.more")).build(msg);
							this.tempOwn(on(item, "click", lang.hitch(this, "runLink", notification)));
						} else if (notification.action){
							css.add(item, "MatcNotificationItemClickable");
							db.a("", " " + this.getNLS("notification.more")).build(msg)
							this.tempOwn(on(item, "click", lang.hitch(this, "runAction", notification)));
						} else {
							this.tempOwn(on(item, "click", lang.hitch(this, "runNothing", notification)));
						}
					}
					if (notification.lastUpdate > lastNoticationView){
						newNotifications++;
					}
				}
				this.popup.appendChild(cntr);
				if (newNotifications > 0){
					this.bubble = db.div("MatcNotificationBubble", newNotifications).build(this.button);
				}
			},

			runMore (n, e){
				this.stopEvent(e);
				this.hideDropDown();

				var d = new Dialog();
				var db = new DomBuilder();
				var cntr = db
					.div("MatcDialog MatcDialogNotification")
					.build();

				db.h2("", n.title)
					.build(cntr);

				var content = db
					.div("MatcDialogNotificationContent")
					.build(cntr)

				if (n.video) {
					db.div("MatcDialogNotificationVideo")
						.div("", n.video, true)
						.build(content);
				}

				db.p("", n.more, true)
					.build(content);

				d.popup(cntr, this.domNode);
			},


			runLink (n, e){
				this.stopEvent(e);
				this.hideDropDown();
				location.href = n.link;
			},

			runNothing (n, e){
				this.stopEvent(e);
				this.hideDropDown();
			},

			runAction (n, e){
				this.stopEvent(e);
				this.hideDropDown();
			},

			onVisible (){
				if (this.bubble){
					this.button.removeChild(this.bubble);
					delete this.bubble;
				}
				Services.getUserService().setLastNotication()
				// this._doPost("/rest/user/notification/last.json", {});
			},

			onTimestampUpdate  (){
				this.logger.log(-1, "onTimestampUpdate", "enter");
			},

			async getLastView () {
				let result = await Services.getUserService().getLastNotication()
				if (this.debug){
					return 0;
				}
				return result.lastNotification;
			}
    },
    mounted () {
    }
}
</script>