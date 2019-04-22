onComment:function(e){
    this.stopEvent(e);
    this.stop();
        
    var db  = new DomBuilder();
    
    this.popup = db.div("vommondPopup").build(this.btnComment);
    
    var cntr = db.div("MatcPlayerCommentCntr MatcPadding").build(this.popup);
    
    
    this.popupInput = new Input();
    this.popupInput.setPlaceholder("Enter the tag");
    this.popupInput.setCss("form-control");
    this.popupInput.placeAt(cntr);
    
    var hints= [];
    var temp = {};
    var sessions = this.annotation.sessions;
    for(var id in sessions){
        var tags = sessions[id];
        for(var i=0; i< tags.length; i++){
            var t = tags[i];
            if(!temp[t.tag]){
                hints.push({value: t.tag, label: t.tag});
            }
            temp[t.tag] = true;
        }
    }
    this.popupInput.setHints(hints);
    this.popupInput.focus();

    var bar = db.div("MatcButtonBar MatcMarginTop").build(cntr);
    var close = db.div("MatcLinkButton", "Close").build(bar);
    var save = db.div("MatcButton", "Save").build(bar);
    
    this.popupBodyListener = on(win.body(), touch.press, lang.hitch(this, "closePopup"));
    this.popupBackListener = on(this.popup, touch.press, lang.hitch(this, "stopPropagation"));
    this.popupCloseListener = on(close, touch.press, lang.hitch(this, "closePopup"));
    this.popupSaveListener = on(save, touch.press, lang.hitch(this, "addTag"));
    var me = this;
    this.popupKeyListener = on(this.popupInput.input,  "keyup", function(e){
         var k = e.keyCode ? e.keyCode : e.which;
         if(k == 13){
             me.addTag();
         }
    });
},

addTag:function(e){
    this.stopEvent(e);
    
    var tag = this.popupInput.getValue();

    var tags = this.getTags();
    tags.push({
        tag : tag,
        time : this.currentTime + this.min,
        start  :this.currentTime
    });
    
    this.saveAnnotation();

    this.closePopup();
    
    this.start();
},

removeTag:function(tag,e){
    this.stopEvent(e);

    var temp = [];		
    var tags = this.getTags();
    for(var i=0; i< tags.length; i++){
        var t = tags[i];
        if(t.time!= tag.time && t.tag != tag.tag){
            temp.push(t);
        }
    }
    this.annotation.sessions[this.sessionID] = temp;
    
    this.saveAnnotation();

},


saveAnnotation:function(){
    
    if(this.mode=="public"){
        topic.publish("App.Notification.Success", "Please register to save changes...");
    } else {
        if(this.annotation.id){
            this._doPost("rest/annotations/apps/"+this.model.id + "/" + this.annotation.id + ".json" , this.annotation);
        } else {
            this.annotation = this._doPost("rest/annotations/apps/"+this.model.id , this.annotation);
        }
    }

    
    this.renderEventList();
},

getTags:function(){
    if(!this.annotation.sessions[this.sessionID]){
        this.annotation.sessions[this.sessionID] = []; 
    }
    return this.annotation.sessions[this.sessionID];
},


closePopup:function(e){
		
    this.stopEvent(e);
    this.popupBodyListener.remove();
    this.popupBackListener.remove();
    this.popupCloseListener.remove();
    this.popupSaveListener.remove();
    
    this.btnComment.removeChild(this.popup);
    delete this.popup;
    delete this.popupBodyListener;
    delete this.popupBackListener;
    delete this.popupCloseListener;
    delete this.popupSaveListener;
    this.popupInput.destroy();
    delete this.popupInput;
},
