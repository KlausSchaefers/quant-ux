
<template>
	<div class="VommondInputList">

		<table>
			<tbody>
                    <tr class="" v-for="(option,i) in options" :key="option"
							:class="[{'MatcFormRowDNDHover': i === hoverRow}, {'MatcFormRowDNDSelect': i == dragRow}]"
							:draggable="isDraggable"
							@dragstart="onDragStart($event, i)"
							@dragover="onDragOver($event, i)"
							@dragleave="onDragLeave($event, i)"
							@drop="onDrop($event, i)"
						>
                        <td class="MatcDialogTableSelectCntr">
                            <div class="MatcFormRowDND">    
                                <QIcon icon="HandleDND"  @mouseover="isDraggable = true" @mouseout="isDraggable = false" ></QIcon>      
                                <CheckBox :value="option === selected" @change="onCheckBoxChange(i, option)" v-if="hasSelection"/>
                            </div>
                        </td>                 
                       
                        <td >
							<input class="form-control" :value="option" @keyup="onChangingOption($event, i, option)" @change="onOptionChange($event, i, option)" ref="inputs"/>
                        </td>
                       
						<td class="MatcFormRowRemove">                   
                        	<QIcon icon="DeleteX"  @click="removeOption(i, option)" ></QIcon>     
                        </td>
                    </tr>

                    <tr>
                        <td class="MatcDialogTableSelectCntr">
                           
                        </td>                 
                       
                        <td >
							<input class="form-control" placeholder="Create a new value" v-model="newValue" @change="onNewOption()"/>
                        </td>
                       
						<td class="MatcFormRowRemove">                   
                        	
                        </td>
                    </tr>
                 </tbody>
		</table>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
//import css from 'dojo/css'
import lang from 'dojo/_base/lang'
// import on from 'dojo/on'
// import touch from 'dojo/touch'
import Logger from 'common/Logger'
//import Input from 'common/Input'
import CheckBox from 'common/CheckBox'
import DomBuilder from 'common/DomBuilder'
import QIcon from 'page/QIcon'
//import {iconDOM} from 'page/QIconUtil'

export default {
	name: 'OptionsList',
	mixins: [DojoWidget],
	data: function () {
		return {
			dragRow: -1,
			hoverRow: -1,
			selected: false,
			isDraggable: false,
            newValue: '',
			options: [],
			inline: true,
			placeholder: "Enter a new value",
			removeIcon: "mdi mdi-close-circle",
			remove: true,
			check: "none",
			add: true,
			newValueMessage: "Enter a value",
			checkNewOption: false,
			edit: true,
			hints: []
		}
	},
	components: {
		'CheckBox': CheckBox,
		'QIcon': QIcon
	},
	computed: {
		hasSelection() {
			return this.check !== 'none'
		},
	},
	methods: {
		postCreate() {
			this.log = new Logger("InputList");
			this.db = new DomBuilder();
		},

		setHints(h) {
			this.log.log(-1, "setHints()", "enter", h)
			this.hints = h
		},

		setSelected(checked) {
			this.selected = checked;
		},

		blur() {
			
		},

		getSelected() {
			this.blur();
			return this.selected;
		},

		setOptions(o) {
			this.options = lang.clone(o);
		},

		getOptions() {
			if (this.newValue) {
                const newValue = this.stripHTML(this.newValue)
				this.options.push(newValue);
                this.selected = newValue
			}
			return this.options;
		},


		isSelected(option) {
			return this.selected === option;
		},

		getLabel(option) {
			let result = option;
			if (this.labelFCT) {
				result = this.labelFCT(option);
			}
			return this.unStripHTML(result);
		},

		onDragStart(e, i) {
			e.dataTransfer.setData("text", i);
			e.dataTransfer.effectAllowed = 'move';
			this.dragRow = i
		},

		onDrop(e, i) {
			e.preventDefault();
			const data = e.dataTransfer.getData("text");
			const j = data * 1
			if (this.options[i] && this.options[j]) {
				const temp = this.options[i]
				this.options[i] = this.options[j]
				this.options[j] = temp
			}
			this.dragRow = -1
			this.hoverRow = -1
		},

		onDragOver(e, i) {
			e.preventDefault();
			this.hoverRow = i
		},

		onDragLeave () {
			this.hoverRow = -1
		},

		setLabelFct(fct) {
			this.labelFCT = fct;
		},

        onChangingOption (e, i,) {
            const input = e.target;
            const newValue = this.stripHTML(input.value);
            this.options[i] = newValue
        },

		onOptionChange (e, i, oldvalue) {
			const input = e.target;
            const newValue = this.stripHTML(input.value);
            this.options[i] = newValue
            if (this.isSelected(oldvalue)) {
                this.selected = newValue
            }
		},

		onCheckBoxChange(j, option) {
			if (this.isSelected(option)) {
				this.selected = null;
			} else {
				this.selected = this.options[j];
			}
		},

		cleanUp() {
		},

		onNewOption() {
			if (this.newValue) {
                const newValue = this.stripHTML(this.newValue)
				this.options.push(newValue);
                this.selected = newValue
			}
            this.newValue = ''
		},

		removeOption (i, option) {
			if (this.isSelected(option)) {
				this.selected = false;
			}
			this.options.splice(i, 1);
		},

		destroy () {
		}
	},
	mounted() {
	}
}
</script>