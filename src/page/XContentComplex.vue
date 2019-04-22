
<template>
     <div class="MatcCMSContent">
							<div data-dojo-attach-point="containerNode"></div
						 </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import window from 'dojo/window'
import query from 'dojo/query'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Evented from 'dojo/Evented'
import _Widget from 'common/_Widget'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import DropDownButton from 'page/DropDownButton'
import Comment from 'page/Comment'
import LabelCheckBox from 'common/LabelCheckBox'




export default {
    name: 'ContentComplex',
    mixins:[Evented, DojoWidget],
    data: function () {
        return {
            role: "user", 
            titleDivID: "", 
            buttonDivID: "", 
            imageWidth: 5, 
            textWidth: 7
        }
    },
    components: {},
    methods: {
        postCreate: function() {	
			this.db = new DomBuilder();
		},
		
		setValue:function(value){
			this.value = value;
			
			this.domNode.innerHTML="";
			delete this.lastSection;
			this._txts = [];
			
			var role = this.user.role;
			
			this.renderTitle(value, role);
			
			this.renderAbstract(value, role);
			
	
						
			if(value.sections){
				

				for(var i=0; i< value.sections.length; i++){
					var s = value.sections[i];
					
					/**
					 * chekc here if we create new sectio or append to exisitng one
					 */
					var section = this.lastSection;
					if(s.newSection || !section){
						section = this.renderSection(this.domNode);
					}

					
					if(this["renderSecion" + s.type]){
		
						var div = this["renderSecion" + s.type](section, s,i, role);
						if(role == "admin" && div){
							css.add(div, "MatcActionBox");
							var del = this.db.div("MatcActionBoxRemove").span("MatcPointer mdi mdi-close-circle").build(div);
							this.tempOwn(on(del, touch.press, lang.hitch(this, "_removeSection", i)));
						}
						
					} else {
						console.warn("setValue() > Not supported type "+ s.type,  " > " + "renderSecion" + s.type);
					}
					
					
				}
			}
					
			this.renderFooter(role, this.domNode);
			
			//this.renderComment(this.domNode);
			
	
		},
		
		renderPreview:function(value){
			delete this.lastSection;
			var preview = document.createElement("div");
			if(value.sections){
				for(var i=0; i< value.sections.length; i++){
					var s = value.sections[i];
					var section = this.lastSection;
					if(s.newSection || !section){
						section = this.renderSection(preview);
					}
					if(this["renderSecion" + s.type]){
						var div = this["renderSecion" + s.type](section, s,i, "preview");
					} 
				}
			}
			
			return preview;
		},
		
		
		renderSection:function(parent){
			var section =  this.db.div("MatcSection").div("container").build(parent);
			this.lastSection = section;
			return section;
		},
		
		renderSecionNew:function(){
	
		},
		
		
		renderSecionFullWidth:function(parent, section, i, role){
		
		
			var row = this.db.div("row").build(parent);
			
			var txt = this.db.div("col-md-12").div("MatcLead MatcJustify").build(row);
			this.renderSectionTxt(txt, section, i,  role);
				
			return row;
		},
		
		
		renderSecionTwoTextColumns:function(parent, section, i, role){
			
			var row = this.db.div("row").build(parent);
			
			var txt = this.db.div("col-md-7").div("MatcLead MatcJustify MatcCMSContentSectionTxt").build(row);
			this.renderSectionTxt(txt, section, i, role);
			
			var txt2 = this.db.div("col-md-5").div("MatcLead MatcJustify MatcCMSContentSectionTxt").build(row);
			txt2.innerHTML = section.txt2;
			if(role =="admin"){
				css.add(txt2, "MatcContentWidgetInlineEdit");
				this.own(on(txt2, touch.press, lang.hitch(this,"onEdit", i, txt2, "_updateSectionTxt2")));
			}
			
				
			return row;
		},
		
		
		renderSecionFullWidthImage:function(parent, section, i, role){
	
			var row = this.db.div("row").build(parent);
			
			var imgCntr = this.db.div("col-md-12 MatcCMSContentSectionImage").build(row);
			this.renderSectionImage(imgCntr, section, i, role);
			
			return row;
			
		},
		
		renderSecionLeftImage:function(parent, section, i, role){
			
			var row = this.db.div("row").build(parent);
			
			var imgCntr = this.db.div("col-md-" + this.imageWidth + " MatcCMSContentSectionImage").build(row);			
			this.renderSectionImage(imgCntr, section, i, role)
			
			var txt = this.db.div("col-md-" + this.textWidth + " ").div( "MatcLead MatcCMSContentSectionTxt").build(row);
			this.renderSectionTxt(txt, section, i, role);
		
			return row;
		},
		
		renderSecionRightImage:function(parent, section, i, role){
			
			var row = this.db.div("row").build(parent);
			
			var txt = this.db.div("col-md-" + this.textWidth).div("MatcLead MatcCMSContentSectionTxt").build(row);
			this.renderSectionTxt(txt, section, i, role);
			
			var imgCntr = this.db.div("col-md-" + this.imageWidth + " MatcCMSContentSectionImage").build(row);
			this.renderSectionImage(imgCntr, section, i, role)
			
			return row;
		},
		
		renderSecionFloatLeftImage:function(parent, section, i, role){
			
			var row = this.db.div("row").build(parent);			
			var cntr =this.db.div("col-md-12").build(row);
			
			var imgCntr = this.db.div("MatcCMSContentSectionImageLeft MatcCMSContentSectionImage").build(cntr);			
			this.renderSectionImage(imgCntr, section, i, role)
			
			var txt = this.db.div("MatcCMSContentSectionTxt MatcLead").build(cntr);
			this.renderSectionTxt(txt, section, i, role);
		
			return row;
		},
		
		renderSecionFloatRightImage:function(parent, section, i, role){
			
			var row = this.db.div("row").build(parent);			
			var cntr =this.db.div("col-md-12").build(row);
			
			var imgCntr = this.db.div("MatcCMSContentSectionImageRight MatcCMSContentSectionImage").build(cntr);
			this.renderSectionImage(imgCntr, section, i, role)
	
			
			var txt = this.db.div("MatcCMSContentSectionTxt MatcLead").build(cntr);
			this.renderSectionTxt(txt, section, i, role);
			
			return row;
		},
		
		renderSecionHiddenRightImage:function(parent, section, i, role){
			
			if(this.lastSection && this.lastSection.parentNode){
				css.add(this.lastSection.parentNode, "MatcContentSectionWidthHiddenImage");
			}

			
			var row = this.db.div("row").build(parent);			
			var cntr =this.db.div("col-md-6").build(row);
			var right = this.db.div("col-md-6").build(row);
			
			var txt = this.db.div("MatcCMSContentSectionTxt MatcLead").build(cntr);
			this.renderSectionTxt(txt, section, i, role);
			
				
			this.renderHiddenImage(this.lastSection, right, section, i, "MatcImageRight", role);
			
			
			return row;
		},
		
		renderSecionHiddenLeftImage:function(parent, section, i, role){
			
			if(this.lastSection && this.lastSection.parentNode){
				css.add(this.lastSection.parentNode, "MatcContentSectionWidthHiddenImage");
			}
			
			var row = this.db.div("row").build(parent);		
			var left = this.db.div("col-md-6").build(row);
			var cntr =this.db.div("col-md-6").build(row);
		
			var txt = this.db.div("MatcCMSContentSectionTxt MatcLead").build(cntr);
			this.renderSectionTxt(txt, section, i, role);
			
			this.renderHiddenImage(this.lastSection, left, section, i, "MatcImageLeft", role);
			

			
			return row;
		},
		
		renderSectionTxt:function(txt, section, i, role){	
			txt.innerHTML = section.txt;
			if(role =="admin"){
				css.add(txt, "MatcContentWidgetInlineEdit");
				this.own(on(txt, touch.press, lang.hitch(this,"onEdit", i, txt, "_updateSectionTxt")));
			}
			
		},
		
		renderSectionImage:function(div, section, i, role){
			

			var img;
			if(section.images.length >0){
				var image = section.images[0];
				var wrapper = this.db.div("MatcCMSContentSectionImage MatcImageWrapper MatcImageWrapperRounded").build(div);
				img = this.db.img("").build(wrapper)
				
				if(section.imageShadow !== false){
					css.add(wrapper, "MatcImageWrapperShadow");
				}
				
				img.src="/rest/cms/images" + image.src;
			} else {	
				if(role =="admin"){	
					img = this.db.div("MatcImageUploadPreview MatcImageUploadAdd").build(div);
					var plus = this.db.span("glyphicon glyphicon-plus-sign").build(img);
				}
			}

			if(role =="admin"){	
				this.tempOwn(on(img, touch.press, lang.hitch(this, "showImageSelectionDialog", i )));				
			} else {
				if(section.images.length >0){
					
					this.tempOwn(on(img, touch.press, lang.hitch(this, "showImageDialog", section)));	
				}		
			}
		
			
		},
		
		
		renderHiddenImage:function(lastSection, div, section, i, cls, role){
			

			var img;
			if(section.images.length >0){

				var imgCntr = this.db.div("MatcImageWrapper  " + cls).div("MatcAboutImage").build(lastSection);
				
				if(section.imageShadow !== false){
					css.add(imgCntr, "MatcImageWrapperShadow MatcImageWrapperBrowser");
				}
				
				var image = section.images[0];
				img = this.db.img("").build(imgCntr);
				img.src="/rest/cms/images" + image.src;
			} else {	
				if(role =="admin"){	
					img = this.db.div("MatcImageUploadPreview MatcImageUploadAdd").build(div);
					var plus = this.db.span("glyphicon glyphicon-plus-sign").build(img);
				}
			}

			if(role =="admin"){	
				this.tempOwn(on(img, touch.press, lang.hitch(this, "showImageSelectionDialog", i )));				
			} else {
				if(section.images.length >0){
					
					this.tempOwn(on(img, touch.press, lang.hitch(this, "showImageDialog", section)));	
				}		
			}
		
			
		},
		

		renderAbstract:function(content, role){
			if(role == "admin"){
				var section = this.db.div("MatcMarginTop").div("container").build(this.domNode);
				var row = this.db.div("row MatcContentBox MatcPadding MatcMarginBottom").build(section);
				
				var abs = this.db.div("col-md-10  ").div("").label("", "Abstract").parent().div("MatcContentWidgetInlineEdit",content.abs).build(row);
				
				this.own(on(abs, touch.press, lang.hitch(this,"onEdit", 0, abs, "_updateAbs")));
				
			
				var imgCntr = this.db.div("col-md-2").build(row);
				this.db.label("", "Preview Image").build(imgCntr);
				if(content.image ){
					img = this.db.div("MatcImageUploadPreview MatcImageUploadPreviewHorizontal").build(imgCntr);
					img.style.backgroundImage = "url(/rest/cms/images" + content.image+ ")";
				} else {
					img = this.db.div("MatcImageUploadPreview MatcImageUploadAdd").build(imgCntr);
					var plus = this.db.span("glyphicon glyphicon-plus-sign").build(img);
				}
				
				
				this.tempOwn(on(img, touch.press, lang.hitch(this, "showImageSelectionDialog", -1 )));		
			
				var div = this.db.div().build(row);
				
			
				var qux = new LabelCheckBox();
				qux.setLabel("Quant-UX.com");
				qux.setValue(content.qux == true);
				qux.placeAt(div);
				this.tempOwn(on(qux, "change", lang.hitch(this, "_updateDomain", "qux" )));
				
				
				var fax = new LabelCheckBox();
				fax.setLabel("Flowalytics.com");
				fax.setValue(content.fax == true);
				fax.placeAt(div);
				this.tempOwn(on(fax, "change", lang.hitch(this, "_updateDomain", "fax" )));
			}
		},
		
		renderFooter:function(role, parent){
			
			
			if(role == "admin"){
			
				var section = this.renderSection(parent);
				var div = this.db.div("col-md-12  MatcButtonBar").build(section);
				
				
				var dropdown = new DropDownButton();
				css.add(dropdown.domNode, "MatcDropDownUp");
				dropdown.setLabel("Add");
				dropdown.setOptions([
				    {label : "New Section", value : {type:"New", newSection:true}},
				    {label : "------------------------", value : ""},
				    {label : "Full Width Text", value : {type:"FullWidth", txt:"Enter text...", images:[]}},
				    {label : "Full Width Image", value : {type:"FullWidthImage", txt:"Enter text...", images:[]}},
				    {label : "2 Text Columns", value : {type:"TwoTextColumns", txt:"Enter text...", txt2:"Enter as econd text", images:[]}},
				    {label : "------------------------", value : ""},
	
				    {label : "Left Image", value : {type:"LeftImage", txt:"Enter text...", images:[]}},
				    {label : "Right Image", value : {type:"RightImage", txt:"Enter text...", images:[]}},
				    {label : "------------------------", value : ""},
				    {label : "Float Right Image", value : {type:"FloatRightImage", txt:"Enter text...", images:[]}},
				    {label : "Float Left Image", value : {type:"FloatLeftImage", txt:"Enter text...", images:[]}},
				    {label : "------------------------", value : ""},
				    {label : "Hidden Right Image", value : {type:"HiddenRightImage", txt:"Enter text...", images:[]}},
				    {label : "Hidden Left Image", value : {type:"HiddenLeftImage", txt:"Enter text...", images:[]}}
	
	            ]);
				this.tempOwn(on(dropdown, "change", lang.hitch(this, "_addSection")));
				dropdown.placeAt(div)
				
				var btn =this.db.div("MatcButton  ", "Save").build(div);
				this.tempOwn(on(btn, touch.press, lang.hitch(this,"_updateContent")));
				
				
			}
		},
		
		
		renderComment:function(parent){
			var section = this.renderSection(parent);
			var comment = new Comment({contentID:this.value.id, userID : this.user.id, insertPosition:"top"});
			comment.placeAt(section);
		},
		
		
		
		
		onEdit:function(i, txt, callback, e){
			
			var db = new DomBuilder();
			
			var div = db.div("MatcDialogXL MatcPadding").build();
			
			var input = db.textarea("form-control MatcContentWidgetEditor").build(div);
			input.value = txt.innerHTML;
			
			var bar = db.div("MatcButtonBar MatcMarginTop").build(div);
			
			var cancel = db.a("MatcLinkButton", "Cancel").build(bar);
			var write = db.div("MatcButton", "Save").build(bar);
			
			var d = new Dialog({overflow:true});
			d.own(on(write, touch.release, lang.hitch(this,callback, i, input, txt, d)));
			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.popup(div, e.target);
			
		},
		
		showImageSelectionDialog:function(sectionID ,e){
			
			var section = this.value.sections[sectionID];

			
			var list = this._doGet("/rest/cms/images.json");
		
			var d = new Dialog({overflow:true});
			
			var db = new DomBuilder();
			var div = db.div("MatcDialogXXL MatcPadding").build();
			var cntr = db.div("MatcContentImageUploadContainer").build(div);
			

			var bar = db.div("MatcButtonBar MatcMarginTop").build(div);
			var cancel = db.a("MatcLinkButton", "Cancel").build(bar);
			var footer = db.div("MatcToolbarPopupFooter").build(div);
			
			
			var shadow = new LabelCheckBox();
			shadow.setLabel("Shadow");
			if(section){
				shadow.setValue(section.imageShadow);
			}
			shadow.placeAt(footer);
			
			db.span("MatcToolbarPopupFooterNone glyphicon glyphicon-remove-sign").build(footer);
			db.span("", "No Image").build(footer);
			
			this._renderFileList(list, cntr, d, sectionID, shadow);
			
			if(sectionID!=-1){
				d.own(on(footer, touch.press, lang.hitch(this,"_updateSectionImage", sectionID, null,d)));	
			} else {
				d.own(on(footer, touch.press, lang.hitch(this,"_updatePreviewImage", null, d)));
				
			}
			
			

			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.popup(div, e.target);
		},
		
		
		_renderFileList:function(list, cntr, d, sectionID, shadow){
			
			cntr.innerHTML="";
			
			var db = new DomBuilder();
			
			var add = db.div("MatcContentImageUploadContainerItem").div("MatcImageUploadPreview MatcImageUploadAdd MatcImageUploadPreviewXXL").build(cntr)
			var plus = db.span("glyphicon glyphicon-plus-sign").build(add);			
			var file = db.input("MatcImageUploadFile").build(plus);
			file.type="file";
			d.tempOwn(on(file, touch.press, function(e){e.stopPropagation();}));
			d.tempOwn(on(file, "change", lang.hitch(this,"_uploadFile", file, d, sectionID,cntr, shadow )));
		
			
			
			for(var i=0; i< list.length; i++){
				var fileName = list[i];
				if(fileName.indexOf(".jpg") > 0  || fileName.indexOf(".png") >0){
					var item = db.div("MatcToolbarDropDownButtonItem  MatcContentImageUploadContainerItem").build(cntr);
					var img = db.div("MatcImageUploadPreview MatcImageUploadPreviewXXL  MatcImageUploadPreviewHorizontal").build(item)
					img.style.backgroundImage = "url(/rest/cms/images" + fileName+ ")";
					if(sectionID!=-1){
						d.own(on(item, touch.press, lang.hitch(this,"_updateSectionImage", sectionID, fileName,d, shadow)));
					} else {
						d.own(on(item, touch.press, lang.hitch(this,"_updatePreviewImage", fileName, d)));
					}
					db.span("", fileName).build(item);
				}	
			}
		},
	
		
		_uploadFile:function(file, d, sectionID, cntr, shadow){
			
			var files = file.files;
			var me = this;			
			var formData = new FormData();
			var names = {};
			for(var i = 0; i < files.length; i++) {
				formData.append('file', files[i]);
			}
			
			
			// now post a new XHR request
			var xhr = new XMLHttpRequest();
			xhr.open('POST', '/rest/cms/images/new.json');
			xhr.onload = function () {
			  if (xhr.status === 200) {
				  //d.close();
				  //me.showImageSelectionDialog(sectionID,e);
					var list = me._doGet("/rest/cms/images.json");
					me._renderFileList(list, cntr, d, sectionID, shadow);
			  } else {
				  console.error(xhr);
			  }
			};
			
			xhr.send(formData);
			
			
		},
			
		
		showImageDialog:function(section,e){
			
			var image = section.images[0];
			
			var d = this.db.div("MatcDialogXL MatcPadding MatcCMSContentSectionImage").build();
			
			var i = this.db.div().img().build(d);
			i.src = "/rest/cms/images" + image.src;	
			
			var dialog = new Dialog();
			dialog.popup(d, e.target);			
		},
		
		_addSection:function(value){
			if(!value){
				this.setValue(this.value);
				return;
			}
			
			if(!this.value.sections){
				this.value.sections=[];
			}
			this.value.sections.push(value);
			this.setValue(this.value);
		},
		
		_removeSection:function(i){
			var ok = confirm("Delete section " + i);
			if(ok){
				this.value.sections.splice(i,1);
				this.setValue(this.value);
			}
		
		},
		
		renderTitle:function(value, role){
			if(role == "admin"){
				var title = document.getElementById(this.titleDivID);
				title.setAttribute("contentEditable", true);
				this.title = title;
			}
		},
		
	
		
		
		setTitleDiv:function(id){
			this.titleDivID = id;
		},
		
		setButtonDiv:function(id){
			this.buttonDivID = id;
		},
		
		setUser:function(user){
			this.user = user;
			
		},
		
		
		_updateSectionImage:function(i, fileName,d,shadow, e){
	
			this.stopEvent(e);		
			var s = this.value.sections[i];
			if(fileName){
				s.images[0] = {
					src : fileName,
					des : ""
				};
			} else {
				s.images = [];
			}
			s.imageShadow = shadow.getValue();
		
			d.close();
			this.setValue(this.value);
		},
		
		_updatePreviewImage:function(image, d, e){
			this.stopEvent(e);
			this.value.image = image;
			d.close();
			this.setValue(this.value);
		},
		
		_updateAbs:function(i, input, txt, d,e){
			this.stopEvent(e);			
			txt.innerHTML = input.value;
			this.value.abs = input.value;
			d.close();
		},
		
		_updateDomain:function(domain, checked){
			this.value[domain] = checked;
		},
		
		_updateSectionTxt:function(i, input, txt, d,e){
			this.stopEvent(e);			
			txt.innerHTML = input.value;
			var s = this.value.sections[i];
			s.txt = input.value;
			d.close();
		},
		
		_updateSectionTxt2:function(i, input, txt, d,e){
			this.stopEvent(e);			
			txt.innerHTML = input.value;
			var s = this.value.sections[i];
			s.txt2 = input.value;
			d.close();
		},
		
		_updateContent:function(e){
			this.stopEvent(e);
	
			var title = this.title.innerHTML;
			title = title.replace(/<br>/g, "");
			this.value.title = title;
			
			var preview = this.renderPreview(this.value);
		
			this.value.preview = preview.innerHTML;
			
			this._doPost("/rest/blog/" +this.value.id + ".json", this.value);
			this.emit("save", this.value);	
			
			this.setValue(this.value);
			return false;
		},
		
		cleanUp:function(){
			
		},
    }, 
    mounted () {
    }
}
</script>