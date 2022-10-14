<template>
     <div class="MatcList MatcAppList">
		<div class="row MatcMarginBottom">
			<div class="col-md-8 ">
				<h2>Screen Statistics
				<a href="#help/analyze/screens.html" class="MatcHelpIcon"><span class="mdi mdi-help-circle"></span></a>

				</h2>
			</div>
			<div class="col-md-4 MatcRight">
				<a class="MatcButton" data-dojo-attach-point="downloadBTN">
				Download
				</a>
				<a class="MatcButton MatcButtonToggle" data-dojo-attach-point="detailsBtn">
				Details
				</a>
			</div>
		</div>
		<div class="MatcListContainer" data-dojo-attach-point="container"> Loading...
		</div>
	</div>
</template>
<style>
  @import url("../style/list.css");
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import ProgressBar from 'common/ProgressBar'
import Table from 'common/Table'
import Util from 'core/Util'
import AppList from 'page/AppList'
import Heat from 'dash/Heat'
import DataFrame from 'common/DataFrame'


export default {
    name: 'DashScreenList',
    mixins:[AppList, Layout, DojoWidget],
    data: function () {
        return {
            detailed: false,
            hasSearch: false
        }
    },
    components: {},
    methods: {
        initListeners:function(){

			this.own(on(this.detailsBtn, touch.press, lang.hitch(this,"toggleDetail")));
			this.own(on(this.downloadBTN, touch.press, lang.hitch(this,"downloadCSV")));
		},

		init:function(){
			if(this.detailed){
				css.add(this.detailsBtn, "MatcButtonActive");
			} else {
				css.remove(this.detailsBtn, "MatcButtonActive");
			}
		},

		initSearch:function(){

		},

		toggleDetail:function(){
			this.detailed = !this.detailed;
			this.render(this.value);
		},

		downloadCSV:function(){
			console.debug('downlaod')

			var csvContent="Name,Clicks(ABS),Clicks(%),Views(ABS),Views(%),Duration(AVG),Duration(%)";

			var screens = this.value;
			for(var i=0; i < screens.length; i++){
				csvContent +="\n";
				var screen = screens[i];
				csvContent += screen.name + ",";
				csvContent += screen.clicksAbs + ",";
				csvContent += Math.round(screen.clicks *100) + "%,";
				csvContent += screen.viewsAbs + ",";
				csvContent +=  Math.round(screen.views*100) + "%,";
				csvContent += this.formatTime(screen.durationAvg) + ",";
				csvContent += Math.round(screen.duration*100) + "%";
			}


			var blob = new Blob([csvContent],{
			    type: "text/csv;charset=utf-8;"
			});
			if(window.navigator.msSaveOrOpenBlob) {
		        window.navigator.msSaveBlob(blob, 'Screens.csv');
		    } else {
		    	 var elem = window.document.createElement('a');
		         elem.href = window.URL.createObjectURL(blob);
		         elem.download = 'Screens.csv';
		         document.body.appendChild(elem)
		         elem.click();
		         document.body.removeChild(elem);
		    }
		},

		render:function(list){

			if(this.widgets){
				for(var id in this.widgets){
					this.widgets[id].destroy();
				}
			}
			this.cleanUp();
			this.init();
			this.widgets = [];

			this.renderTable(list);

		},

		renderTable:function(screens){

			var temp =[];
			for(var i=0; i < screens.length; i++){
				var screen = screens[i];
				temp.push({
					id : screen.id,
					name : screen.name,
					clicks : screen.clicksAbs + ' <span class="MatcDashTableTdHint">( ' + Math.round(screen.clicks *100) + "% )</span>",
					views : screen.viewsAbs + ' <span class="MatcDashTableTdHint">( ' + Math.round(screen.views*100) + "% )</span>",
					duration : this.formatTime(screen.durationAvg) + ' <span class="MatcDashTableTdHint">( ' + Math.round(screen.duration*100) + "% )</span>",
				});
			}

			var appID = this.model.id;
			this.container.innerHTML ="";
			var table = new Table();
			var me = this;
			table.setColumns([
  			    {
					"query" :"name",
					"label":"Name"
				},
				{
					"query" : "views",
					"label" : this.getNLS("dashScreenList.views")
				},
				{
					"query" :"clicks",
					"label": this.getNLS("dashScreenList.clicks")
				},
				{
					"query" :"duration",
					"label": this.getNLS("dashScreenList.dwel")
				}

			]);


			table.setActions([
				{
					"render" : function(node, screen){
						var group = document.createElement("div");
						css.add(group, "MatcButtonGroup");
						node.appendChild(group);
						var play = document.createElement("a");
						css.add(play, " MatcButton ");
						play.innerHTML= me.getNLS("dashScreenList.table-action");
						if(me.mode == "public"){
							play.href= "#/examples/" +appID + "/analytics/workspace/" +screen.id+ ".html";
						} else {
							play.href= "#/apps/" +appID + "/analytics/workspace/" +screen.id+ ".html";
						}
						group.appendChild(play);
					}
				}
			]);

			table.setValue(temp);
			table.placeAt(this.container);
		},

		setEvents:function(events){
			var df = new DataFrame(events);
			df.sortBy("time");
			this.screenGrouping = df.groupBy("screen");
		},

		setValue:function(value){
			this.model = value;
			this.value = this.getScreens();
			this.render(this.value);
		},

		setMethod:function(phone, screen){
			if(this.mode == "public"){
				phone.href ="#/examples/" +this.model.id + "/analytics/workspace/" +screen.id + ".html";

			} else {
				phone.href ="#/apps/" +this.model.id + "/analytics/workspace/" +screen.id+ ".html";

			}
		},

		createScreenWidget:function(item){

			var heatmap =  new Heatmap();

			var screenDF = this.screenGrouping.get(item.id);
			if(screenDF){
				var screenEvents = screenDF.as_array();
				heatmap.setValue(screenEvents);
			}

			return heatmap;
		},


		renderDescription:function(app, item){


			var div = document.createElement("div");
			css.add(div, "MatcDashScreenListWidgets");
			item.appendChild(div);

			var des = this.getDescription(app);
			var p =document.createElement("p");
			p.innerHTML = des;
			div.appendChild(p);


			this.renderRow(this.getNLS("dashScreenList.views"),app.views, div );

			this.renderRow(this.getNLS("dashScreenList.dwel"),app.duration, div );

			this.renderRow(this.getNLS("dashScreenList.clicks"),app.clicks, div );


		},

		renderRow:function(label, value, div){

			var row = document.createElement("div");
			css.add(row,"VommondProgressRow");
			div.appendChild(row);

			var lbl = document.createElement("span");
			lbl.innerHTML=label;
			row.appendChild(lbl);

			var clicks = new ProgressBar();
			clicks.color = this.PROGRESS_COLOR;
			clicks.placeAt(row);
			clicks.setValue(value);

		},

		getDescription:function(screen){
			var des = "";
			if(screen.name){
				des += "<b>" + screen.name + "</b> ";
			}
			return des;
		},

		addDesciption:function(screen, prop, label){
			var value =0;
			if(screen[prop]){
				value = screen[prop];
			}
			return label + ' : <i>' + value +  '</i>  ';
		},


		onRenderDone:function(value){

			for(var i=0; i< value.length; i++){
				var screen = value[i];
				if(this.widgets[i]){
					this.widgets[i].setModel(this.model, screen.id);
				}
			}
		}
    },
    mounted () {
    }
}
</script>