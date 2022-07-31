<template>
     <div class="MatcToolbarLayerList MatcToobarPropertiesSection MatcToolbar" v-show="isVisible">
		<div class="MatcToolbarLayerListCntr" data-dojo-attach-point="cntr">
			<div class="MatcToolbarLayerListScreenCntr">
				<div class="MatcLayerListScreens">

						<div class=" MatcToolbarSectionContent" >
							<Tree
								:value="root"
								@open="onOpen"
								@locked="onLocked"
								@hidden="onHidden"
								@select="onSelect"
								@changeLabel="onChangeLabel"
								@dnd="onDnd"/>
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
import ModelUtil from 'core/ModelUtil'
import Tree from 'common/Tree'

export default {
	name: 'LayerList',
	props: ['value', 'includeMasterNodes'],
    mixins:[Util, DojoWidget],
    data: function () {
        return {
			selection: [],
			screenListeners: {},
			collapsed: {},
			openNodes: {},
			root: {},
			trees: [],
			nodes: {},
			isVisible: true,
			hasOptions: true,
			isDebug: false
        }
    },
    components: {
			'Tree': Tree
		},
    methods: {
      	postCreate (){
			this.logger = new Logger("LayerList");
			this.logger.log(2,"constructor", "entry > " + this.mode);
			this.isDebug = location.hostname.indexOf('localhost') >= 0
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

		onLocked (id, value) {

			this.logger.log(-1, "onLocked", "entry > ", id + ': ' + value);
			if (this.controller) {
				let node = this.nodes[id]
				if (node) {
					let type = node.type
					if (type == "widget") {
						this.controller.updateWidgetProperties(id, {'locked': value}, 'props', true, true)
					}
				}
			}
		},

		onHidden (id, value) {
			this.logger.log(-1, "onHidden", "entry > ", id + ': ' + value);
			if (this.controller) {
				let node = this.nodes[id]
				if (node) {
					let type = node.type
					if (type == "widget") {
						this.controller.updateWidgetProperties(id, {'hidden': value}, 'props', true, true)
					}
					if (type == "group") {
						this.controller.setGroupHide(id, value)
					}
				}
			}
		},

		onOpen (id, open) {
			this.logger.log(-1, "onOpen", "entry > ", id + ': ' + open);
			this.openNodes[id] = open
		},

		onSelect (ids) {
			this.logger.log(1, "onSelect", "entry > ", ids);
			
			if (ids.length === 1) {
				let node = this.nodes[ids[0]]
				if (node) {
					if (this.canvas) {
						let type = node.type
						if (type === 'widget') {
							this.canvas.onWidgetSelected(node.id, true, true);
						}
						if (type === 'group') {
							this.canvas.onGroupSelected(node.id, true);
						}
						if (type === 'screen') {
							this.canvas.onScreenSelected(node.id);
						}
					}
				} else {
					this.logger.log(-1, "onSelect", "No node > ", ids);
				}
			} else {
				if (this.canvas) {
					this.canvas.onMutliSelected(ids, true);
				}
			}
		},

		onChangeLabel (id, txt) {
			this.logger.log(1, "onChangeLabel", "entry > ", id + ': ' + txt);
			if (this.toolbar && this.controller) {
				const node = this.nodes[id]
				if (node) {
					this.toolbar.onModelNameChange(id, node.type, txt);
					const type = node.type
					if (type == "widget"){
						this.controller.setWidgetName(id, txt)
					} else if (type == "screen"){
						this.controller.setScreenName(id, txt)
					} else if (type == "group"){
						this.controller.setGroupName(id, txt)
					}
				} else {
					this.logger.log(-1, "onChangeLabel", "No node > ", id);
				}
			}
		},

		onDnd (from, to) {
			this.logger.log(-1, "onDnd", "entry > ", from + ' -> ' + to);

			let fromNode = this.nodes[from]
			let toNode = this.nodes[to]
			if (fromNode && toNode) {
				if (this.controller) {
					this.controller.changeLayer({
						source: fromNode.id,
						widgetID: fromNode.widgetID,
						screenID: fromNode.screenID,
						groupID: fromNode.groupID,
						type: fromNode.type
					}, {
						source: toNode.id,
						widgetID: toNode.widgetID,
						screenID: toNode.screenID,
						groupID: toNode.groupID,
						type: toNode.type
					});
				} else {
					console.warn('No controller')
				}

				if (fromNode.fixed === true && this.canvas) {
					setTimeout (() => {
						this.canvas.showHint('Fixed widgets are always rendered on top.')
					}, 1000)
				}
			}
		},

		render (model){
			this.logger.log(2,"render", "render > ", model);
			this.model = model;
			this.createNestedModel(model);
		},


		createNestedModel (model){
			const result = [];
			const root = {
				name: "",
				id: model.id,
				children: []
			};
			this.nodes = {}
			this.variantTemplates = {}

			// 1) Build group lookup
			let parentGroups = {}
			for (let id in model.groups) {
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

			if (model.templates) {
				for (let id in model.templates) {
					const t = model.templates[id]
					this.variantTemplates[id] = t.variant
				}
			}
			
			// canvas children
			const canvasChildren = ModelUtil
				.getCanvasWidgets(model)
				.map(w => w.id)
			
			if (canvasChildren.length > 0) {
				let canvasScreen = {
					id:'CanvasScreen',
					type: 'canvas',
					name: 'Canvas',
					children: canvasChildren
				}
				let tree = this.createTreeForScreen(canvasScreen.id, canvasScreen, model, parentGroups)
				root.children.push(tree)
			}

			// build a tree for each screen
			for(let id in model.screens){
				let screen = model.screens[id];
				let tree = this.createTreeForScreen(id, screen, model, parentGroups)
				root.children.push(tree)
			}

			/**
			 * Now still add before and after listeners
			 */
			this.trees = result
			this.root = root
		},

		createTreeForScreen (id, screen, model, parentGroups) {
		
			if (this.openNodes[screen.id] === undefined) {
				this.openNodes[screen.id] = true
			}
			let tree = {
				name: screen.name,
				label: screen.name,
				id: screen.id,
				domId: this.getScrollId(screen.id),
				css: 'MatcToolbarLayerListScreen',
				icon: this.getAppTypeIcon(model, screen),
				closeIcon : this.getCloseIcon(screen),
				openIcon: this.getOpenIcon(screen),
				open: this.openNodes[screen.id],
				type:'screen',
				children: []
			};
			this.nodes[id] = tree

			let groupNodes = {};
			let masterNodes = {}
			let sorted = this.getSortedScreenChildren(model, screen)
			for(let i=0; i< sorted.length; i++){
				let widget = sorted[i];

				/**
				 * FIMXE: Make here a extra group for the master widgets
				 */
				if (widget.inherited) {
					if (this.includeMasterNodes) {
						let masterScreen = model.screens[widget.masterScreen]
						let master = {
							id: masterScreen.id,
							name: masterScreen.name,
							inherited: true,
							type: 'Master'
						}
						let node = this.createNode(widget, widget.id, screen.id, null, 'widget')
						let masterNode = this.getOrCreateMaster(master, screen.id, masterNodes, tree, widget)
						masterNode.children.push(node)
					}
				} else {

					/**
					 * Check if we have a group
					 */
					if (parentGroups[widget.id]){
						let group = parentGroups[widget.id]
						let node = this.createNode(widget, widget.id, screen.id, group.id, 'widget')
						let groupNode = this.getOrCreateGroup(group, screen.id, groupNodes, parentGroups, tree, widget)
						groupNode.children.push(node)
					} else {
						let node = this.createNode(widget, widget.id, screen.id, null, 'widget')
						tree.children.push(node)
					}
				}
			}
			return tree
		},

		getSortedScreenChildren (model, screen) {
			let widgets = {}
			for (let i=0; i < screen.children.length; i++){
				let widgetID = screen.children[i];
				let widget = model.widgets[widgetID];
				if (widget) {
					widgets[widget.id] = widget
				}
			}
			return this.getOrderedWidgets(widgets).reverse();
		},

		getOrCreateMaster (masterScreen, screenId, masterNodes, tree, widget) {
			if (!masterNodes[masterScreen.id]) {
				let newMasterNode = this.createNode(masterScreen, widget.id, screenId, null, 'master', false);
				masterNodes[masterScreen.id] = newMasterNode;
				/**
				 * This should be at the back
				 */
				tree.children.push(newMasterNode);
			}
			return masterNodes[masterScreen.id]
		},

		getOrCreateGroup (group, screenId, groupNodes, parentGroups, tree, widget) {
			/**
			 * Check if we have to create a group node, or can recycle one
			 */
			if (!groupNodes[group.id]){


				/**
				 * Check if we have to create parent groups
				 */
				if (parentGroups[group.id]) {
					let parentGroup = parentGroups[group.id]

					let newGroupNode = this.createNode(group, widget.id, screenId, parentGroup.id, 'group');
					groupNodes[group.id] = newGroupNode;

					let parentNode = this.getOrCreateGroup(parentGroup, screenId, groupNodes, parentGroups, tree, widget)
					parentNode.children.push(newGroupNode)
				} else {
					let newGroupNode = this.createNode(group, widget.id, screenId, null, 'group');
					groupNodes[group.id] = newGroupNode;

					tree.children.push(newGroupNode);
				}
			}
			return groupNodes[group.id]
		},

		createNode (box, widgetID, screenID, groupId, type = 'widget', defaultIsOpen = true) {
			if (this.openNodes[box.id] === undefined) {
				this.openNodes[box.id] = defaultIsOpen
			}
			let node = {
				id: box.id,
				domId: this.getScrollId(box.id),
				widgetID: widgetID,
				screenID: screenID,
				groupID: groupId,
				label: box.name, // + ' (' + box.id + ') ' + box.z,
				icon: this.getNodeIcon(box, type),
				closeIcon : this.getCloseIcon(box),
				openIcon: this.getOpenIcon(box),
				children:[],
				type: type,
				locked: false,
				hidde: false,
				open: this.openNodes[box.id],
				inherited: box.inherited,
				fixed: false,
				z: box.z,
				hasOptions: this.hasOptions
			}

			if (box.props) {
				node.locked = box.props.locked === true
				node.hidden = box.props.hidden === true
			}

			if (box.children) {
				// for groups we compute the hidden property.
				const allChildren = ModelUtil.getAllGroupChildren(box, this.model)
				const hiddenChildren = allChildren.filter(childId => {
					let child = this.model.widgets[childId]
					if (child) {
						if (child.props.hidden === true) {
							return true
						}
					}	
					return false
				})
				if (hiddenChildren.length === allChildren.length) {
					node.hidden = true
				}
			}

			if (box.style && box.style.fixed) {
				node.fixed = true
			}

			if (box.inherited) {
				node.css = "MatcLayerListWidgetInherited"
				node.disabled = true
			}

			if (box.props && box.props.label) {
				node.hint = box.props.label
			}

			if (box.isNewTemplateChild) {
				node.label += ' *' // keep this for debugging
			}

			if (this.isDebug) {
				node.label += ` [${node.z}]`
			}
			
			this.nodes[node.id] = node
			this.lastNode = node
			return node;
		},

		getScrollId (id) {
			return 'layerListItem' + id
		},

		getCloseIcon (box) {
			if (box.type == "Master") {
				return "mdi mdi-content-duplicate";
			}
			return 'mdi mdi-chevron-right MatcTreeIcon' // mdi-select
		},

		getOpenIcon (box) {
			if (box.type == "Master") {
				return "mdi mdi-content-duplicate";
			}
			return 'mdi mdi-chevron-down MatcTreeIcon'
		},


		getNodeIcon (box, type){
			
			if (box.template) {
				if (box.isRootTemplate) {
					return "mdi mdi-view-grid-outline MatcIcon45";
				} else {
					return "mdi mdi-border-all-variant  MatcIcon45"; // return "mdi mdi mdi-border-all-variant MatcIcon45";
				}
			}

			if (type === 'group') {
				return 'mdi mdi-crop-free'
			}
			if (box.type == "Master") {
				return "mdi mdi-content-duplicate";
			}
			if (box.type == "Label") {
				return "mdi mdi-format-title";
			}


			if (Math.abs(box.w - box.h) < 10) {
				if (box?.style?.borderTopLeftRadius > box.w /2) {
					return 'mdi mdi-circle-outline'
				}
				return 'mdi mdi-crop-square'
			}
			if (box.w > box.h) {
				return "mdi mdi-crop-landscape";
			}
			return "mdi mdi-crop-portrait";
		},


		getAppTypeIcon (model, screen) {
			if (screen.type === 'canvas') {
				return "mdi mdi-border-none-variant MatcTreeIconRoot";
			} else if (model.type == "smartphone") {
				return "mdi mdi-cellphone MatcTreeIconRoot";
			} else if (model.type == "tablet") {
				return "mdi mdi-tablet-ipad MatcTreeIconRoot";
			}
			return "mdi mdi-laptop MatcTreeIconRoot";
		},

		changeName (box) {
			let node = this.nodes[box.id]
			if (node) {
				this.$set(node, 'label', box.name)
			} else {
				let tree = this.trees.find(t => t.id === box.id)
				if (tree) {
					this.$set(tree, 'name', box.name)
				} else {
					/**
					 * This can happen for REST and OR nodes,
					 * which are not shown in the tree
					 */
					this.logger.warn('changeName', 'No node with id: ' + box.id)
				}
			}
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

		selectMulti (ids) {
			this.selectNode(ids)
		},

		selectScreen(screenID) {
			this.selectNode([screenID])
		},

		selectNode (ids) {
			this.unSelectNodes()
			this.$nextTick(() => {
				ids.forEach(id => {
					let node = this.nodes[id]
					if (node) {
						this.$set(node, 'selected', true)
					}
				})
				this.selection = ids
				this.scrollToSelection(ids)
			})			
		},

		scrollToSelection(ids) {
			const id = ids[0]
			if (id) {
				const element = document.getElementById(this.getScrollId(id))
				if (element) {
					element.scrollIntoViewIfNeeded(true)
				} else {
					this.logger.warn('scrollToSelection', 'No node with id: ' + this.getScrollId(id))
				}
			}
		},

		unSelectNodes () {
			for (let id in this.nodes) {
				let node = this.nodes[id]
				this.$set(node, 'selected', false)
				//this.$set(node, 'scroll', false)
			}
		},

		setSelectedWidget (){
			console.warn('setSelectedWidget() DEPRCATED', new Error().stack)
		},

		setSelectedGroup (){
			console.warn('setSelectedGroup() DEPRCATED', new Error().stack)
		},

		hide () {
			this.isVisible = false
		},

		show () {
			this.isVisible = true
		}
	},
	watch: {
		value (v) {
			this.render(v)
		}
	},
  mounted () {
	if (this.value) {
		this.render(this.value)
	}
  }
}
</script>