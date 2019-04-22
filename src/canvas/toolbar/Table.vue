
<template>
     <div class="MatcToolbarTable">														
		<div data-dojo-attach-point="cntr" class="MatcToolbarTableBody" >		
		</div>			
		<div class="MatcToolbarTableUpload" data-dojo-attach-point="upload">
			<a href="#">Upload CSV</a> 
			<input type="file" data-dojo-attach-point="file" class="MatcImageUploadFile"/>
		</div>		
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import win from 'dojo/_base/win'
import keys from 'dojo/keys'
import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import Util from 'core/Util'

export default {
    name: 'Table',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            value: null, 
            inputEvent: "change", 
            rows: 100, 
            columns: 10, 
            maxWidth: 1000, 
            columnWidths: [], 
            rowHeight: 30, 
            columnNames: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"], 
            data: [], 
            widthDirty: false, 
            dataDirty: false, 
            inputClicked: false, 
            actionKeys: [37], 
            mode: "blur"
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.render();
			this.own(on(this.file, "change", lang.hitch(this,"_onFileChange")));	
			this.own(on(win.body(), "keydown", lang.hitch(this,"onBodyKeyDown")));
			//this.own(on(win.body(), "keyup", lang.hitch(this,"onBodyKeyUp")));
			this._initFileDnD(this.domNode);
			
			this.selection = {
				r : 0,
				c: 0
			};
		},
	
		isDirty (){
			return this._dirty;
		},
		
		setWidget (widget){
			this.widget = widget;
			
			if(widget.props.widths){
				var widths = widget.props.widths;
				var sum =0;
				for(let i = 0; i < widths.length; i++){
					this.columnWidths[i] = widths[i];
					sum+= widths[i];
				}
				var w = Math.floor((this.maxWidth - sum) / (this.columns-widths.length));
				for(let i = widths.length; i < this.columns; i++){
					this.columnWidths[i] = w;
				}
			} else {
				for(let c = 0; c < this.columns; c++){
					this.columnWidths[c] = this.maxWidth / this.columns;
				}
			}
			
			if(widget.props.data){
				this.data = lang.clone(widget.props.data);
			}
			
			this.renderData(this.data);
			this.renderColumnWidths();
		},
		
		
		
		
		getWidths (){
			
			var result = [];
			var columns = this.getDimensions().c;
			for(var i=0; i< columns;i++){
				result[i] = this.columnWidths[i]; 
			}			
			return result;
		},
		
		getData (){
			var data = [];
			
			var maxC = 0;
			for(let r=0; r < this.inputs.length; r++){
				var inputRow = this.inputs[r];
				var row = [];
				for(let c=0; c < inputRow.length; c++){
					var value = this.inputs[r][c].value;
					if(value){
						row[c] = value;
						maxC = Math.max(maxC, c);
					}
				}
				if(row.length >0){
					data[r] = row;
				}
			}
				
			maxC++;
			/**
			 * Fill up undefined
			 */	
			for(let r=0; r < data.length; r++){
				for(let c=0; c < maxC; c++){
					if(data[r][c] == undefined){
						data[r][c] ="";
					}
				}
			}			
			return data;
		},
		
		
		clearData (){
			if(this.inputs){
				for(var r=0; r < this.inputs.length; r++){
					var row = this.inputs[r];
					for(var c=0; c < row.length; c++){
						row[c].value ="";
					}
				}
			}
		},
		
		
		renderData (data){
			data = this.parseData(data);
		
			for(var r=0; r < data.length; r++){
				if(this.inputs[r]){
					var row = data[r];
					if(row){
						for(var c=0; c < row.length; c++){
							if(row[c] != undefined && row[c] != null){
								this.inputs[r][c].value = row[c];
							}
						}
					}
					
				}				
			}
		},
		
		render (){
			
			this.tds = [];
			this.inputs = [];
			this.columnTDs = [];
			var db = new DomBuilder();
			
			var table = db.table("").build();
			var tbody = db.tbody().build(table);
			
			/**
			 * header
			 */
			var thead = db.element("thead").build(table)
			var tr = db.element("tr").build(thead);
		
			var td = db.element("td").build(tr);
			td.style.width = "30px";
			
			for(let c =0; c < this.columns; c++){
				let td = db.element("td").build(tr);
				td.style.width = this.columnWidths[c] + "px";
				var lbl = db.div("MatcToolbarTableLabel", this.columnNames[c]).build(td);			
				var handle  = db.div("MatcToolbarTableColumnHandle").build(lbl);
				this.tempOwn(on(handle, touch.press, lang.hitch(this, "onBarPress",c, handle)));			
				this.columnTDs[c] = td;
			}
			
			
			for(let r=0; r < this.rows; r++){
				let tr = db.element("tr").build(tbody);
				let td = db.element("td").build(tr);
				td.style.height = this.rowHeight + "px";
				td.innerHTML = r;
				td.style.width = "30px";
				this.inputs.push([]);
				for(let c =0; c < this.columns; c++){
					td = db.element("td").build(tr);					
					td.style.height = this.rowHeight + "px";
					let input = db.element("input","MatcIgnoreOnKeyPress").build(td);
					this.tempOwn(on(input, "focus", lang.hitch(this, "onFocus", r, c, input)));
					this.tempOwn(on(input, "blur", lang.hitch(this, "onBlur", r, c, input)));
					this.tempOwn(on(input, touch.press, lang.hitch(this, "onClick", r, c, input)));
					this.tds.push(td);
					this.inputs[r].push(input);					
				}
			}					
			var scroll = this.$new(ScrollContainer);		
			scroll.placeAt(	this.cntr);
			scroll.wrap(table);	
		},
		
		
		onBodyKeyDown (e){
			console.debug("onBodyKeyDown", this.mode, this.selection.r, this.selection.c);
			
			 var isCntrl = e.altKey || e.ctrlKey || e.metaKey;
			 var k = e.keyCode ? e.keyCode : e.which;
			 var row = this.selection.r*1;
			 var column = this.selection.c*1;
			

			 if(k == 86  && isCntrl){ // ctrl -v
				 this.onPaste(this.selection.r, this.selection.c, e);
				 this.stopPropagation(e);
				 return;
			 }
			 
			 if(this.mode == "blur"){
				 	
				 switch(k){
				 	case 37:
				 		this.selectInput(row, column-1);
				 		 this.stopEvent(e);
				 		break;
				 	case 39:
				 		this.selectInput(row, column +1);
				 		 this.stopEvent(e);
				 		break;
				 	case 40:
				 		 this.selectInput(row+1, column);
				 		 this.stopEvent(e);
				 		 break;
				 	case 38:
				 		 this.selectInput(row-1, column);
				 		 this.stopEvent(e);
				 		 break;
				 		 
				 	case keys.DELETE:
				 		 if(this.inputs[row] && this.inputs[row][column]){
							input = this.inputs[row][column];
							input.value = "";
				 		 }
				 		 this.stopEvent();
				 		 break;
				 	case keys.BACKSPACE:
				 		 if(this.inputs[row] && this.inputs[row][column]){
								input = this.inputs[row][column];
								input.value = "";
					     }
				 		 this.stopEvent();
				 		 break;
				 	default:
						this.focusInput(row, column);
				 		break;
				 		
				 }
				
		
			 } else {
				 
				 var pos = 0;
				 var length = 0;
				 var input = null;
				 if(this.inputs[row] && this.inputs[row][column]){
					input = this.inputs[row][column];
					length = input.value.length
					pos = this.getCarretPosition(input);
				 }
				
				 if(k == 37 ){ // left
					 if(pos == 0){
						 this.selectInput(row, column-1, e.target);
						 this.stopEvent(e);
					 }
				 }
			
				 if(k == 39 ){ // right
					 if(pos == length){
						this.selectInput(row, column +1, e.target);
						this.stopEvent(e);
					 }
				 }
				 
				 if(k == 40){ // down
					 this.selectInput(row+1, column);
				 }
				 
				 if(k == 38){ // up
					 this.selectInput(row-1, column);
				 }
			 }
			 
			 this.dataDirty = true;

		},
		
		
		
		onFocus (r, c){
			this.selection = {
				r : r,
				c: c
			};
			this.mode = "focus";
		},
		
		onBlur (){
			this.mode = "blur";
			this.unselectAll();
		},
		
		/**
		 * https://www.lucidchart.com/techblog/2014/12/02/definitive-guide-copying-pasting-javascript/
		 */
		onPaste (row, column){
			var parent = this.domNode;
			var input = null;
			if(this.inputs[row] && this.inputs[row][column]){
				input = this.inputs[row][column];
			}
			var me = this;
			 
			/**
			 * Hacky method: We create a hidden textarea, give it focus to receive
			 * the paste event. Then we check if we had CSV or normal and act accordingly.
			 */
			var hidden = document.createElement("textarea");
			css.add(hidden, "MatcToolbarTableHidden");
			parent.appendChild(hidden);
			hidden.focus();
			
			setTimeout(function(){
				var pastedValue = hidden.value;
				if(pastedValue.indexOf("\n") > 0){ // (pastedValue.indexOf(",") > 0 || pastedValue.indexOf("\t") > 0) 
					me._importCSV(pastedValue, row, column);
				} else {
					if(input){
						input.value += pastedValue;
					}
				}
				parent.removeChild(hidden);
			
			},20);
		},

		
		focusInput (r,c){
			if(this.inputs[r] && this.inputs[r][c]){
				 var input = this.inputs[r][c];
				 input.value.length;
				 input.focus();
				 // input.value = input.value;
			}
			delete this.inputClicked;
		},
		

		selectInput (r,c){
			console.debug("selectInput", r, c);
			r = Math.max(0,r);
			c = Math.max(0,c);
			this.selection = {
				r : r,
				c: c
			};
			
			this.unselectAll();
			
			if(this.inputs[r] && this.inputs[r][c]){
				 var input = this.inputs[r][c];
				 css.add(input, "MatcToolbarTableInputFocus");
				 if(input.scrollIntoViewIfNeeded){
					 input.scrollIntoViewIfNeeded();
				 }
			}		
		},
		
		unselectAll (){
			for(var row=0; row < this.inputs.length; row++){
				var inputRow = this.inputs[row];
				for(var col=0; col < inputRow.length; col++){
					inputRow[col].blur();
					css.remove(inputRow[col], "MatcToolbarTableInputFocus");
				}
			}
		},

		getCarretPosition (input){
			 if ('selectionStart' in input) {
			
		        // Standard-compliant browsers
		        return input.selectionStart;
		     } else if (document.selection) {
	            // IE
	            // input.focus();
	            var sel = document.selection.createRange();
	            var selLen = document.selection.createRange().text.length;
	            sel.moveStart('character', -input.value.length);
	            return sel.text.length - selLen;
		     }
		},
		
		/***************************************************
		 * Data
		 ***************************************************/
	
	
		parseData (data){
			
			/**
			 * for now assume csv
			 */
			if(data.substring){
				var table = [];
				var lines = data.split("\n");
				for(var i=0; i < lines.length; i++){
					var line = lines[i];
					table.push(line.split(","));
				}
				return table;
			} else {
				return data;
			}
			
		},
		
		
		getData_bak (){
			var data = [];			
			var maxC = 0;
			for(let r=0; r < this.inputs.length; r++){
				let inputRow = this.inputs[r];
				let row = [];
				for(let c=0; c < inputRow.length; c++){
					let value = this.inputs[r][c].value;
					if(value){
						row[c] = value;
						maxC = Math.max(maxC, c);
					}
				}
				if(row.length >0){
					data[r] = row;
				}
			}
				
			maxC++;
			/**
			 * Fill up undefined
			 */	
			for(let r=0; r < data.length; r++){
				for(let c=0; c < maxC; c++){
					if(!data[r]){
						data[r] = [];
					}
					if(data[r][c] == undefined){
						data[r][c] ="";
					}
				}
			}
			
			return data;
		},
		
		
		/***************************************************
		 * Resizing
		 ***************************************************/
	
		
		onBarPress (c,handle, e){
			this.stopEvent(e);
			this.dndStartPos = this.getMouse(e);								
			
			this.moveListener = on(win.body(),touch.move, lang.hitch(this,"onBarMove", c));
			this.releaseListener = on(win.body(),touch.release, lang.hitch(this,"onBarRelase", c, handle));
			
			css.add(this.domNode, "MatcToolbarTableReizeCol");
			css.add(handle, "MatcToolbarTableColumnHandleSelected");
			return false;
		},
		
		onBarMove (c, e){
			this.stopEvent(e);
			
			var pos = this.getMouse(e);
			var dif = this.dndStartPos.x - pos.x;			
			var w = this.columnWidths[c] - dif;
			
			if(this.columnTDs[c]){
				this.columnTDs[c].style.width = w+"px";
			}
			if(this.columnTDs[c+1]){
				dif = this.columnWidths[c] - w;
				var nextWidth = this.columnWidths[c+1] + dif;
				this.columnTDs[c+1].style.width = nextWidth+"px";				
			}
			
			return false;
		},
		
		onBarRelase (c, handle, e){
			var pos = this.getMouse(e);
			var dif = this.dndStartPos.x - pos.x;
			var w = this.columnWidths[c] - dif;
			this.columnWidths[c] = w;
			if(this.columnTDs[c+1]){
				this.columnWidths[c+1] += dif;
			}
			
			this.renderColumnWidths();
			
			this.stopEvent(e);
			if(this.moveListener){
				this.moveListener.remove();
				delete this.moveListener;
			}
			if(this.releaseListener){
				this.releaseListener.remove();
				delete this.releaseListener;
			}
			
			css.remove(handle, "MatcToolbarTableColumnHandleSelected");
			css.remove(this.domNode, "MatcToolbarTableReizeCol");
			this.dndStartPos = null;			
			this.widthDirty = true;
		},
		
		
		renderColumnWidths (){
			for(var i=0; i< this.columns; i++){
				this.columnTDs[i].style.width = this.columnWidths[i]+"px";
			}
		},
		
		getMouse (e){	 
		     var result = {};
		     result.x = e.pageX;
		     result.y = e.pageY;
		     return result;
		},

		getDimensions (){
			var maxC = 0;
			var maxR = 0;
			for(var r=0; r < this.inputs.length; r++){
				var inputRow = this.inputs[r];
				var add=false;
				for(var c=0; c < inputRow.length; c++){
					var value = this.inputs[r][c].value;
					if(value){
						maxC = Math.max(maxC, c);
						add = true;
					}
				}
				if(add){
					maxR = r;
				}
			}
			return {c : maxC+1, r: maxR+1};
		},
	
		
		/***************************************************
		 * Upload Methods
		 ***************************************************/
		
		_uploadData (files){
			
			try{
				if (window.File && window.FileReader && window.FileList && window.Blob) {
					
					if(files[0]){
						var me = this;
						var r = new FileReader();
					    r.onload = function(e) { 
					    	  var contents = e.target.result;
							  me.clearData();
					    	  me._importCSV(contents, 0, 0)
					    };
					    r.readAsText(files[0]);
					}
				}
			} catch(e){
				console.error('udpateData() > Error', e)	
			}			
			css.remove(this.domNode, "MatcToolbarTableUploadDND");
		},
		
		_importCSV (data, r_offset, c_offset){
				
			var table = this.getData();
			var lines = data.split("\n");
			for(var r=0; r < lines.length; r++){
				var line = lines[r];
				
				var row;
				if(line.indexOf("\t") >0 ){
					row = line.split("\t");
				} else {
					row = line.split(",");
				}
				
				for(var c =0; c < row.length; c++){
					if(!table[r + r_offset]){
						table[r + r_offset]  = [];
					}
					table[r + r_offset][c + c_offset] = row[c];
				}
			}
	
			this.dataDirty = true;
		
			this.renderData(table);
	
	
		},
		
		_onFileChange (e){
			this.stopEvent(e);
			var files = this.file.files;
			this._uploadData(files);
		},
		
		
		_onFileDropped (e){
			e.preventDefault;
			e.preventDefault();
			this.stopEvent(e);
		
			var dt = e.dataTransfer;
			var files = dt.files;

			this._uploadData(files);
			return false;
		},
		
	
		_initFileDnD (node){
			this._fileDnDListeners = [];
			
			this._fileDnDListeners.push(on(node, "dragenter", lang.hitch(this, "_stop", false)));
			this._fileDnDListeners.push(on(node, "dragover", lang.hitch(this, "_stop", false)));
			this._fileDnDListeners.push(on(node, "dragleave", lang.hitch(this, "_stop", true)));
			this._fileDnDListeners.push(on(node, "drop", lang.hitch(this, "_onFileDropped")));
		},
		
		_stop (leave, e){
			e.preventDefault;
			e.preventDefault();
			if(leave){
				css.remove(this.domNode, "MatcToolbarTableUploadDND");
			} else {
				css.add(this.domNode, "MatcToolbarTableUploadDND");
			}
			return false;
		},
		
		_destroyFileDnD (){
			if(this._fileDnDListeners){
				for(var i=0; i< this._fileDnDListeners.length; i++){
					this._fileDnDListeners[i].remove();
				}
			}
			delete this._fileDnDListeners;
		},
		
		destroy (){
			this._destroyFileDnD();
			this.cleanUpTempListener();

		}
    }, 
    mounted () {
    }
}
</script>