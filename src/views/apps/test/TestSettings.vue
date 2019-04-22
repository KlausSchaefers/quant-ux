
<template>
	
	<div class="MatcMarginTop">
	</div>
	
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import hash from 'dojo/hash'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import Table from 'common/Table'
import Util from 'core/Util'
import Plan from 'page/Plan'
import Services from 'services/Services'


export default {
	name: 'TestSettings',
	props: ['test', 'app', 'annotation', 'events'],
    mixins:[Util, Plan, DojoWidget],
    data: function () {
        return {
            appID: "", 
            userID: ""
        }
    },
	components: {},
	computed: {
		pub () {
			return this.$route.meta && this.$route.meta.isPublic
		}
	},
    methods: {
        postCreate (){
			this.logger = new Logger("TestSettings");
			this.logger.log(4,"postCreate","enter > " + this.appID + " > " + this.pub);
			this.db = new DomBuilder();
			if (this.test) {
				this.setValue(this.test)
			}
		},	
		
		setValue (data){
			this.render(data);
		},
		
		render (data){			
			this.cleanUpTempListener();					
			this.renderTaskTable(data);		
			this.checkPlan();
		},
		
	
		renderTaskTable (data){			
			this.domNode.innerHTML = ""
			if(data.tasks && data.tasks.length > 0){				
				var me = this;
				var tbl = this.$new(Table);
				tbl.setColumns([
					{
						"query" :"name",
						"label": this.getNLS("testSettingsTaskName"),
						"edit" : function(input, task){
							task.name = input.value;
							me.save(false);
						},
						"width" : 20 
					},
					{
						"query" :"description",
						"label" : this.getNLS("testSettingsTaskDescription"),
						"edit" : function(input, task){
							task.description = input.value;
							me.save(false);
						},
						"width" : 70 
					}
				]);
				tbl.setActions([
					{
						"label" : "X",
						"css" : "MatcButton MatcButtonRed MatcMarginRight",
						"callback" : function(task, i, node){
							me.onDelete(node, task, i);
						}
					}
				]);
				tbl.placeAt(this.domNode);
				tbl.setValue(data.tasks);
			} else {
				this.db.div("MatcHint MatcMarginBottom", this.getNLS("testSettingsTaskAddHint")).build(this.domNode);
			}		
			this.addBTN = this.db.div("MatcButton", this.getNLS("testSettingsAddTask")).build(this.domNode)		
			this.own(on(this.addBTN, touch.press, lang.hitch(this, "addTaskToTable", this.addBTN, null)));		
		},
		
		checkPlan (){
			this.logger.log(8,"checkPlan","enter");
			if(this.pub){
				if (!this.planCanAddTask(this.test)) {
					css.add(this.addBTN, "MatcButtonGreen");
					this.addBTN.innerHTML = this.getNLS("testSettingsUpgradePlan");
				} else {
					css.remove(this.addBTN, "MatcButtonGreen");
					this.addBTN.innerHTML = this.getNLS("testSettingsAddTask");
				}
			}
		},

		async addTaskToTable (){
			
			if(!this.pub && !this.planCanAddTask(this.test)) {
				hash("#/upgrade-plan/tasks.html");
				return;
			}

			if(!this.test.tasks){
				this.test.tasks = [];
			}
			this.test.tasks.push({
				name : "Task "+(this.test.tasks.length +1),
				description : this.getNLS("testSettingTaskDeskPlaceholder"),
				id : "t" +Date.now(),
				flow : [],
			});
			
			this.render(this.test);			
			this.save()
		},
		
		
		onDelete:function(node, task, i){
			
			var name = task.name ? task.name : task.label;
			
			var div = this.db.div("MatcTeamDialog MatcPadding").build();
			
			this.db.div("h3", this.getNLS("testSettingTaskDelete1") + name + this.getNLS("testSettingTaskDelete2")).build(div);
			
			var bar = this.db.div("MatcButtonBar MatcMarginTopXXL").build(div);
					
		
			var write = this.db.div("MatcButton MatchButtonRed", this.getNLS("btn.delete")).build(bar);
			var cancel = this.db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);
		
			
			var d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(this, "removeTask", i, d)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			
			d.popup(div, node);
		},				
	
		removeTask:function(i,d){
			this.test.tasks.splice(i, 1);
			this.render(this.test);
			d.close();
			this.save()
		},
						
		async save (){
			if(this.pub){
				this.showSuccess(this.getNLS("testSettingsRegister"));
			} else {
				console.debug('save', this.test)
				let res = await Services.getModelService().saveTestSettings(this.app.id, this.test)
				if (res.status === 'ok') {
					this.showSuccess('Saved..');
					this.$emit('change', this.test)
				}
			}
		},
		
		cleanUp(){
			this.cleanUpTempListener();
		}
	}, 
	watch: {
		test (v) {
			console.debug('TestSetting.watch() > test', v)
			this.test = v
			this.setValue(v)
		}
	},
    mounted () {
    }
}
</script>