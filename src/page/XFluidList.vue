
<template>
     <div class="MatcList FluidList">
							<div class="row MatcMarginBottom" data-dojo-attach-point="headerDiv"> 
								<div class="col-md-6 ">
									<h2 data-dojo-attach-point="labelBtn"></h2>
								</div>
								<div class="col-md-6 MatcRight">
								
									<div class="MatcListSearchCntr hidden" data-dojo-attach-point="searchCntr">
										<div class="MatcSearchForm"> 
	
											<input type="search" class="" placeholder="Search" data-dojo-attach-point="searchInput"></input>
											<span class="mdi mdi-magnify MatcCreateSearchBtn"  aria-hidden="true" data-dojo-attach-point="searchBtn"></span>
							
										</div>
									</div>
									<a class="MatcButton MatcButtonToggle"  data-dojo-attach-point="detailsBtn">
									Details
									</a>
									<a class="MatcButton MatcButtonToggle hidden MatcMarginLeft"  data-dojo-attach-point="downLoadBtn">
									Download
									</a>
								</div>
							</div>
							<div class="MatcListContainer" data-dojo-attach-point="container"> Loading...
							
							</div>
						
						</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import Evented from 'dojo/Evented'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import _Widget from 'common/_Widget'
import Table from 'common/Table'
import Logger from 'common/Logger'




export default {
    name: 'FluidList',
    mixins:[DojoWidget],
    data: function () {
        return {
            columns: 3, 
            columnOffset: 0, 
            add: "top", 
            remove: true, 
            rowClass: null, 
            mode: "list", 
            details: true, 
            detailsValue: null, 
            search: false, 
            searchFields: [], 
            download: false, 
            downloadFileName: "data.csv", 
            paging: false, 
            pagingSize: 60, 
            pagingPos: 0
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.log = new Logger({className : "de.vommond.matc.FluidList"});
			this.own(on(this.detailsBtn, touch.press, lang.hitch(this,"toggleDetail")));
			this.init();
			this.initSearch();
			if(!this.details){
				css.add(this.detailsBtn, "hidden");
			}
			if(this.details || this.search || this.download){
				css.remove(this.headerDiv, "hidden");
			}
			if(this.download){
				css.remove(this.downLoadBtn, "hidden");
				this.own(on(this.downLoadBtn, touch.press, lang.hitch(this,"onDownload")));
			}
		},
		
		
		
		initSearch:function(){
		
			if(!this.search){
				css.add(this.searchCntr, "hidden");
			} else {
				css.remove(this.searchCntr, "hidden");
				
				this.own(on(this.searchBtn, touch.press, lang.hitch(this, "showSearch")));
				this.own(on(this.searchInput, "keypress", function(e){e.stopPropagation()}));
				this.own(on(this.searchInput, "keydown", function(e){e.stopPropagation()}));
				this.own(on(this.searchInput, "keyup", lang.hitch(this,"onSearch")));
			}
		},
		
		showSearch:function(){
			css.toggle(this.searchCntr, "MatcListSearchVisible");
			var me = this;
			setTimeout(function(){
				me.searchInput.focus();
			}, 10)
		},
		
		
		onSearch:function(e){
			e.stopPropagation();
			
			this.cleanUp();
			
			var filter = this.searchInput.value;
			
			if(filter && filter.length >=2){
				filter = filter.toLowerCase();
				
				var filtered = [];
				for(var i=0; i< this.value.length; i++){
					var item = this.value[i];
					var added = false;
					if(this.searchFields.length > 0){
						for(var j=0; j < this.searchFields.length; j++){
							var field = this.searchFields[j];
							var fieldValue = item[field];
						
							if(!added && fieldValue && fieldValue.indexOf){
								if(fieldValue.toLowerCase && fieldValue.toLowerCase().indexOf(filter)>=0 ){
									filtered.push(item);
									added = true;
								} 
							}
							/**
							 * Step down in arrays
							 */
							if(fieldValue && fieldValue.splice){
								for(var k=0; k < fieldValue.length; k++){
									var arrayValue = fieldValue[k];
									if(!added && arrayValue && arrayValue.indexOf){
										if(arrayValue.toLowerCase && arrayValue.toLowerCase().indexOf(filter)>=0 ){
											filtered.push(item);
											added = true;
										} 
									}
								}
							}
						}
					} else {
						if(item.indexOf && item.toLowerCase().indexOf(filter)>=0 ){
							filtered.push(item);
						}
					}
					
				}
				
				
				this.render(filtered);	
			} else {
			
				this.render(this.value);	
			}
			
		},
		

		init:function(){
			if(this.mode!="list"){
				css.add(this.detailsBtn, "MatcButtonActive");
			} else {
				css.remove(this.detailsBtn, "MatcButtonActive");
			}
		},
		
		toggleDetail:function(){
			
			if(this.mode=="list"){
				this.mode="table";
				if(!this.detailsValue){
					this.render(this.value);	
				} else {
					this.render(this.detailsValue);	
				}	
			} else {
				this.mode="list";
				this.render(this.value);	
			}

	

		},
		
		setValue:function(value, details){
			this.value = value;
			if(details){
				this.detailsValue = details;
			}
			
			this.render(value);
		},
		
		setLabel:function(value){
			this.labelBtn.innerHTML = value;
		},
		
		/**
		 * Set the columns count
		 */
		setColumns:function(value){
			this.columns =value;
		},
		
		/**
		 * Set the columns of the details table. Most obey to table.js format
		 */
		setTableColumn:function(cols){
			this.tableColumns = cols;
		},
		
		
		setItemFct:function(fct){
			this.itemRenderFct = fct;
		},
		
		rerender:function(){
			this.render(this.value);
		},
		
		
		render:function(list){
		
			this.init();
			
			this.container.innerHTML ="";
			
			if(this.mode == "table"){				
				this.renderTable(list);			
			} else {
				this.renderFluid(list);
			}
			
			
		},
		
		renderTable:function(list){
			if(this.tableColumns){
				var tbl = new Table();
				tbl.setPaging(this.paging);
				tbl.placeAt(this.container);
				tbl.setColumns(this.tableColumns);
				tbl.setValue(list);
			} else {
				console.warn("renderTable() > No tableColumns defined!");
			}
			this.onRenderDone();
		},
		
		
		renderFluid:function(list){
		
			
			var parent = document.createElement("div");
			
			var width = Math.floor(12 / this.columns);
			var offSet = 0;
			if(this.add=="top"){
				
				var row = this._renderRow(0, parent);
								
				var item = document.createElement("div");
				css.add(item, "MatcFluidListItem col-md-" + width);
				
				this.onRenderAdd(item);
				this.own(on(item, touch.press, lang.hitch(this, "onAdd")));
				
				row.appendChild(item);
				offSet++;
			}
				
			
			var start = 0;
			var end = list.length;
			if (this.paging) {
				this.log.log(-1, "renderFluid", "Paging from " + this.pagingPos)
				start = this.pagingPos * this.pagingSize; 
				end = Math.min(start + this.pagingSize, end);
			}
			/**
			 * FIXME: We should also be able to loop over objects!
			 */
			for(var j = start; j < end; j++){
				
				var i = j +offSet;
				/**
				 * make sure there is a row
				 */
				var row = this._renderRow(i, parent);
				var element = list[j];
				
				var item = document.createElement("div");
				css.add(item, "MatcFluidListItem col-md-" + width);
							
				this.renderItem(item, element, j);
				
				if(this.remove){
					var remove = document.createElement("div");
					css.add(remove, "MatcFluidListItemRemove MatcRemove");
					remove.innerHTML="X";
					item.appendChild(remove);
					this.own(on(remove, touch.press, lang.hitch(this, "onRemoveClick", j, element, item)));
				}
			
				row.appendChild(item);
			}
			 
			
			if(this.add=="bottom"){
				
				var row = this._renderRow(0, parent);
				
				var item = document.createElement("div");
				css.add(item, "MatcFluidListItem col-md-" + width);
				
				this.onRenderAdd(item);
				this.own(on(item, touch.press, lang.hitch(this, "onAdd")));
				
				row.appendChild(item);
				offSet++;
			}
		
			this.renderPading(parent, list);
			
			/**
			 * Finalize rendering and attach to dom
			 */
			this.container.appendChild(parent);
			this._list = list;
			
		
			
			this.onRenderDone();
		},
		
		renderPading:function(parent, list){
			if (this.paging) {
		
				var div = document.createElement("div");
				css.add(div, "MatcFluidListPaging");
				
				var ul = document.createElement("ul");
				div.appendChild(ul);
			
				var steps =  Math.ceil(list.length / this.pagingSize);
				for(var i=0; i< steps; i++){
					li = document.createElement("li");
					ul.appendChild(li);
					li.innerHTML = (i+1) + "";	
					if(i == this.pagingPos){
						css.add(li, "active");
					} else {
						var connection = on(li, "click", lang.hitch(this, "setPos", i));
						this.tempOwn(connection);	
					}
				}
				parent.appendChild(div);
			}
		},
		
		setPos: function(newValue){
			this.pagingPos = newValue;
			this.rerender();
		},
		
		/**
		 * Template methods for child classes to overwrite
		 */
		onRenderDone:function(){
			
		},
		
		onRemoveClick:function(i, element, item, e){
			this.stopEvent(e);
		
			css.add(item, "MatcFluidListItemRemoved");
			
			var me = this;
			setTimeout(function(){
				me.onRemove(i, element);
			}, 500);

		},
		
		onRemove:function(i, element){
			this.emit("remove", {pos : i, item: element});
		},

		onAdd:function(){
			this.emit("add", {});
		},
		
		
		/**
		 * Template methods for child classes to overwrite
		 */
		onRenderAdd:function(parent){
			var div = document.createElement("div");
			css.add(div, "MatcButton");
			div.innerHTML="Add";
			parent.appendChild(div);
		},
		
		
		
		/**
		 * Template methods for child classes to overwrite
		 */
		renderItem:function(node, element, i){
			if(this.itemRenderFct){
				this.itemRenderFct(node, element, i);
			} else {
				console.warn("renderItem() > No item fct passed!");
			}
		},
		
		
		_renderRow:function(i, parent){
			if(!this.currentRow || (i % this.columns) == 0){
				var row = document.createElement("div");
				css.add(row, "MatcFluidListRow row");
				parent.appendChild(row);
				
				if(this.rowClass){
					css.add(row,this.rowClass);
				}
				this.currentRow = row;
			}	
			return this.currentRow;
		},
	
		
		onDownload:function(){
			
			
			
			var csvContent=""; 
			
			if(this.tableColumns){
				for(var i=0; i < this.tableColumns.length; i++){
					var col = this.tableColumns[i];
					if(i > 0){
						csvContent +=",";
					}
					csvContent += col.label;
				}
				csvContent += "\n";
				for(var r=0; r < this.value.length; r++){
					var row = this.value[r];
					for(var i=0; i < this.tableColumns.length; i++){
						var col = this.tableColumns[i];
						if(i > 0){
							csvContent +=",";
						}
						csvContent += row[col.query];
					}
					csvContent += "\n";
				}
				
			} else {
				
			}
			var blob = new Blob([csvContent],{
			    type: "text/csv;charset=utf-8;"
			});
			if(window.navigator.msSaveOrOpenBlob) {
		        window.navigator.msSaveBlob(blob, this.downloadFileName);
		    } else {
		    	 var elem = window.document.createElement('a');
		         elem.href = window.URL.createObjectURL(blob);
		         elem.download = this.downloadFileName;        
		         document.body.appendChild(elem)
		         elem.click();        
		         document.body.removeChild(elem);
		    }
		},
		
		
		cleanUp:function(){
		
		},
    }, 
    mounted () {
    }
}
</script>