
<template>
	<div class="MatcGridConfigSettings MatcToolbarPopUpContainer MatcToolbarPopUpSettings" role="menu" data-dojo-attach-point="ctnr" @keydown.stop="" @keypress.stop="" @keyup.stop="">
		<div class="MatcToolbarTabContainer">
			<div class="MatcToolbarTabs">
				<a :class="{'MatcToolbarTabActive' : tab === 'columns'}" @mousedown.stop="setTab('columns')">Columns</a>
				<a :class="{'MatcToolbarTabActive' : tab === 'rows'}" @mousedown.stop="setTab('rows')">Rows</a>
			</div>
		</div>

		<div v-show="tab === 'columns'" class="MatcGridConfigRows">
			<div class="MatcGridConfigRow" v-for="(col, i) in columnWidths" :key="'col-' + i">
				<input
					type="number"
					class="MatcIgnoreOnKeyPress MatcToobarInput MatcGridConfigInput"
					:disabled="col.unit === 'auto'"
					:value="col.value"
					@change="onColumnValueChange(i, $event.target.value)" />
				<select
					class="MatcToobarInput MatcGridConfigUnit"
					:value="col.unit"
					@change="onColumnUnitChange(i, $event.target.value)">
					<option v-for="u in units" :key="u" :value="u">{{ u }}</option>
				</select>
			</div>
		</div>

		<div v-show="tab === 'rows'" class="MatcGridConfigRows">
			<div class="MatcGridConfigRow" v-for="(row, i) in rowHeights" :key="'row-' + i">
				<input
					type="number"
					class="MatcIgnoreOnKeyPress MatcToobarInput MatcGridConfigInput"
					:disabled="row.unit === 'auto'"
					:value="row.value"
					@change="onRowValueChange(i, $event.target.value)" />
				<select
					class="MatcToobarInput MatcGridConfigUnit"
					:value="row.unit"
					@change="onRowUnitChange(i, $event.target.value)">
					<option v-for="u in units" :key="u" :value="u">{{ u }}</option>
				</select>
			</div>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'

const DEFAULT_VALUE = '1fr'

export default {
	name: 'GridConfigSettings',
	mixins: [DojoWidget],
	data: function () {
		return {
			widget: null,
			tab: 'columns',
			columnWidths: [],
			rowHeights: [],
			units: ['fr', 'px', '%']
		}
	},
	components: {},
	methods: {

		setTab (t) {
			this.tab = t
			this.emit('resize')
		},

		setWidget (widget) {
			this.widget = widget
			this.tab = 'columns'
			this.columnWidths = this._buildEntries(widget.props.columns, widget.props.columnWidths)
			this.rowHeights = this._buildEntries(widget.props.rows, widget.props.rowHeights)
		},

		_buildEntries (count, values) {
			const entries = []
			for (let i = 0; i < count; i++) {
				const raw = (values && values[i]) ? values[i] : DEFAULT_VALUE
				entries.push(this._parseValue(raw))
			}
			return entries
		},

		_parseValue (raw) {
			if (raw === 'auto') {
				return { value: 1, unit: 'auto' }
			}
			const match = /^([0-9]*\.?[0-9]+)(px|fr|%)$/.exec(raw)
			if (match) {
				return { value: parseFloat(match[1]), unit: match[2] }
			}
			return { value: 1, unit: 'fr' }
		},

		_formatValue (entry) {
			if (entry.unit === 'auto') {
				return 'auto'
			}
			const value = (entry.value === null || entry.value === undefined || entry.value === '' || isNaN(entry.value)) ? 1 : entry.value
			return value + entry.unit
		},

		onColumnValueChange (i, value) {
			this.columnWidths[i].value = parseFloat(value)
			this.emitColumnWidths()
		},

		onColumnUnitChange (i, unit) {
			this.columnWidths[i].unit = unit
			this.emitColumnWidths()
		},

		onRowValueChange (i, value) {
			this.rowHeights[i].value = parseFloat(value)
			this.emitRowHeights()
		},

		onRowUnitChange (i, unit) {
			this.rowHeights[i].unit = unit
			this.emitRowHeights()
		},

		emitColumnWidths () {
			const widths = this.columnWidths.map(this._formatValue)
			this.emit('change', 'columnWidths', widths)
		},

		emitRowHeights () {
			const heights = this.rowHeights.map(this._formatValue)
			this.emit('change', 'rowHeights', heights)
		}
	}
}
</script>
