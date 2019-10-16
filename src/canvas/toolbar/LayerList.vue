<template>
     <div class="MatcToolbarLayerList MatcToobarPropertiesSection MatcToolbar">
		<div class="MatcToolbarLayerListCntr" data-dojo-attach-point="cntr">
			<div class="MatcToolbarLayerListScreenCntr">
				<div class="MatcLayerListScreens">
					<div :class="['MatcToolbarSection', {'MatcToolbarSectionCollabsed': isTreeCollapsed(tree)}]" v-for="tree in trees" :key="tree.id">
						<div class="MatcToolbarSectionLabel" @click="toggleTreeCollapsed(tree)">
							{{tree.name}}
							<span class="MatcToolbarSectionChevron MatcLayerListExpandIcon mdi mdi-chevron-down">
							</span>
						</div>
						<div class=" MatcToolbarSectionContent">
							<Tree 
								:value="tree" 
								@open="onOpen"
								@select="onSelect" 
								@changeLabel="onChangeLabel" 
								@dnd="onDnd"/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import Tree from 'common/Tree'

export default {
	name: 'LayerList',
	props: ['value'],
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            sections: [], 
            screenListeners: {}, 
			collapsed: {},
			openNodes: {},
			trees: [],
			nodes: {}
        }
    },
    components: {
		'Tree': Tree
	},
    methods: {
      	postCreate (){
			this.logger = new Logger("LayerList");
			this.logger.log(-1,"constructor", "entry > " + this.mode);	
		},
		
		setController (c){
			this.controller = c;
		},
		
		setCanvas (c){
			this.canvas = c;
		},
		
		setToolbar (t) {
			this.toolbar = t;
		},

		isTreeCollapsed (tree) {
			if (this.collapsed[tree.id] !== null && this.collapsed[tree.id] != undefined) {
				return this.collapsed[tree.id]
			}
			return false
		},

		toggleTreeCollapsed (tree) {
			if (this.collapsed[tree.id] !== null && this.collapsed[tree.id] != undefined) {
				this.$set(this.collapsed, tree.id, !this.collapsed[tree.id])
			} else {
				this.$set(this.collapsed, tree.id, true)
			}
		},

		onOpen (id, open) {
			this.logger.log(-1, "onOpen", "entry > ", id + ': ' + open);
			this.openNodes[id] = open
		},

		onSelect (ids) {
			this.logger.log(-1, "onSelect", "entry > ", ids);
			
			if (ids.length === 1) {
				let node = this.nodes[ids[0]]
				if (node) {
					if (this.canvas) {
						let type = node.type
						if (type === 'widget') {
							this.canvas.onWidgetSelected(node.id, true);
						}
						if (type === 'group') {
							this.canvas.onGroupSelected(node.id, true);
						}
					}
				} else {
					this.logger.log(-1, "onSelect", "No node > ", ids);
				}
			}
		},

		onChangeLabel (id, txt) {
			this.logger.log(-1, "onChangeLabel", "entry > ", id + ': ' + txt);	
			if (this.toolbar && this.controller) {
				let node = this.nodes[id]
				if (node) {
					this.toolbar.onModelNameChange(id, node.type, txt);
					let type = node.type
					if (type == "widget"){
						this.controller.setWidgetName(id, txt)
					} else if (type == "screen"){
						this.controller.setScreenName(id, txt)
					} else if (type == "group"){
						this.controller.setGroupName(id, txt)
					}
				}
			} else {
				this.logger.log(-1, "onChangeLabel", "No node > ", id);
			}
		},

		onDnd (from, to) {
			this.logger.log(-1, "onDnd", "entry > ", from + ' -> ' + to);
			
			let fromNode = this.nodes[from]
			let toNode = this.nodes[to]
			if (fromNode && toNode) {
				if (this.controller) {
					this.controller.changeLayer(
						fromNode.screen, 
						fromNode.id, 
						fromNode.group,
						toNode.screen, 
						toNode.id, 
						toNode.group
					);
				}
			}
		},
		
		render (model){
			this.logger.log(-1,"render", "render > ", model);
			this.model = model;
			this.createNestedModel(model);
		},
		
	
		createNestedModel (model){
			var result = [];
			this.nodes = {}
			
			// 1) Build group lookup
			let parentGroups = {}
			for(let id in model.groups){
				let group = model.groups[id]
				for (let i=0; i < group.children.length; i++) {
					let widgetID = group.children[i]
					parentGroups[widgetID] = group
				}
				if (group.groups) {
					for (let i=0; i < group.groups.length; i++){
						let groupID = group.groups[i]
						parentGroups[groupID] = group
					}
				}
			}
		
			for(let id in model.screens){
				let screen = model.screens[id];
				let widgets = {}
				for (let i=0; i < screen.children.length; i++){
					let widgetID = screen.children[i];
					let widget = model.widgets[widgetID];
					if (widget) {
						widgets[widget.id] = widget
					}
				}
				let sorted = this.getOrderedWidgets(widgets).reverse();			
				let tree = {
					name: screen.name,
					id: screen.id,
					children: []
				};
				let groupNodes = {};
				for(let i=0; i< sorted.length; i++){
					let widget = sorted[i];
					/**
					 * Check if we have a group
					 */
					if (parentGroups[widget.id]){
						let group = parentGroups[widget.id]
						let groupNode = this.getOrCreateGroup(group, screen.id, groupNodes, parentGroups, tree)
						groupNode.children.push(this.createNode(widget, screen.id, group.id))
					} else {
						let node = this.createNode(widget, screen.id, null)
						tree.children.push(node)
					}					
				}
				result.push(tree)				
			}
			this.trees = result
	
		},

		getOrCreateGroup (group, screenId, groupNodes, parentGroups, tree) {
			/**
			 * Check if we have to create a group node, or can recycle one
			 */
			if (!groupNodes[group.id]){
				

				/**
				 * Check if we have to create parent groups
				 */
				if (parentGroups[group.id]) {
					let parentGroup = parentGroups[group.id]

					let newGroupNode = this.createNode(group, screenId, parentGroup.id, 'group');
					groupNodes[group.id] = newGroupNode;

					let parentNode = this.getOrCreateGroup(parentGroup, screenId, groupNodes, parentGroups, tree)
					parentNode.children.push(newGroupNode)
				} else {
					let newGroupNode = this.createNode(group, screenId, null, 'group');
					groupNodes[group.id] = newGroupNode;

					tree.children.push(newGroupNode);
				}
			}
			return groupNodes[group.id]
		},

		createNode (box, screenId, groupId, type = 'widget') {
			if (this.openNodes[box.id] === undefined) {
				this.openNodes[box.id] = true
			}
			let node = {
				id: box.id,
				screen: screenId,
				group: groupId,
				label: box.name,
				icon: this.getNodeIcon(box),
				children:[],
				type: type,
				open: this.openNodes[box.id]
			}
			this.nodes[node.id] = node
			return node;
		},
	
		
		getNodeIcon (box){
			if (box.type == "Label") {
				return "mdi mdi-format-title";
			}
			if (box.type == "Icon") {
				if (box.style.icon){
					return box.style.icon;
				}
			}
			return "mdi mdi-crop-portrait";
		},

		unSelect () {
			this.unSelectNodes()
		},

		selectGroup (groupID){
			this.selectNode([groupID])
		},

		selectWidget (widgetID) {
			this.selectNode([widgetID])
		},

		selectNode (ids) {
			this.unSelectNodes()
			ids.forEach(id => {
				let node = this.nodes[id]
				if (node) {
					this.$set(node, 'selected', true)
				}
			})
		},

		unSelectNodes () {
			for (let id in this.nodes) {
				let node = this.nodes[id]
				this.$set(node, 'selected', false)
			}
		},

		setSelectedWidget (){
			console.warn('setSelectedWidget() DEPRCATED', new Error().stack)
		},
		
		setSelectedGroup (){
			console.warn('setSelectedGroup() DEPRCATED', new Error().stack)
		},
		
		endDND (e){
			this.stopEvent(e);
			// the end node is the dragged node, so we use the ids from the canDND
			// var div = e.target;
			if (this._dndScreenID){
				//console.debug("endDND", this._dndWidgetID, this._dndScreenID, this._dndGroupID);
				if (this.controller){
					this.controller.changeLayer(this._dndStartScreenID, this._dndStartWidgetID, this._dndStartGroupID, this._dndScreenID, this._dndWidgetID, this._dndGroupID);
				} else {
					console.debug("changeLayer(", this._dndStartWidgetID, this._dndStartGroupID, this._dndWidgetID, this._dndGroupID);
				}
			}
			this.cleanDND();
		}

	
    }, 
    mounted () {
		if (this.value) {
			this.render(this.value)
		}
    }
}
</script>