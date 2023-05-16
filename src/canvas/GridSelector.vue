
<template>
     <div class="MatcGridSelector">
	 </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import CheckBox from 'common/CheckBox'
import SegmentButton from 'page/SegmentButton'

export default {
    name: 'GridSelector',
    mixins:[DojoWidget],
    data: function () {
        return {
            defaultGutter: 10,
            defaultColumns: 12
        }
    },
    components: {},
    methods: {
        postCreate: function(){
				this.logger = new Logger({"className":"de.vommond.matc.canvas.GridSelector"});
				this.logger.log(-1, "postCreate", "enter > ");
				this.render();
		},

		render:function(){
			var db = new DomBuilder();

			var row = db.div("container").div("row").div("col-md-12").build(this.domNode);

			let segmentCntr = db.div("form-group").w(200).build(row)
			db.label("", "Type").build(segmentCntr)
			this.type = this.$new(SegmentButton);
			this.type.setOptions([
              {value: "grid", label: "Grid"},
              {value: "columns", label: "Columns"}
            ]);
			this.type.placeAt(segmentCntr);
			this.own(this.type.on("change", lang.hitch(this, "setType")));

			this.gridCntr = db.div(" container").build(this.domNode);
			row = db.div("row").build(this.gridCntr)
			var left = db.div("col-md-12").build(row);
			this.gridHeight = db.formGroup("", "Height", 0).build(left);
			this.gridWidth = db.formGroup("", "Width", 0).build(left);


			this.columnCntr = db.div(" container").build(this.domNode);
			row = db.div("row").build(this.columnCntr)
			left = db.div("col-md-6").build(row);
			var right = db.div("col-md-6  ").build(row);

			this.columnCount = db.formGroup("", "Columns", 0).build(left);
			this.columnOffset = db.formGroup("", "Offset", 0).build(left);
			this.columnGutter = db.formGroup("", "Gutter Width", 0).build(right);
			this.columnWidth = db.formGroup("", "Column Width", 0).build(right);

			row = db.div("container").div("row").div("col-md-12").build(this.domNode);
			var cntr = db.div("MatcMarginTop form-group").build(row);
			this.gridVisible = this.$new(CheckBox);
			this.gridVisible.setLabel("Show Grid");
			this.gridVisible.placeAt(cntr);

			cntr = db.div("MatcMarginTop form-group").build(row);
			this.gridSnap = this.$new(CheckBox);
			this.gridSnap.setLabel("Snapp to Grid");
			this.gridSnap.placeAt(cntr);


			this.makeInt(this.gridWidth);
			this.makeInt(this.gridHeight);
			this.makeInt(this.columnCount);
			this.makeInt(this.columnOffset);
			this.makeInt(this.columnGutter);
			this.makeInt(this.columnWidth);

			this.own(on(this.columnWidth, "change", lang.hitch(this, "setColumnWidth")));
			this.own(on(this.columnGutter, "change", lang.hitch(this, "setColumnGutter")));
			this.own(on(this.columnOffset, "change", lang.hitch(this, "setColumnOffsetAndCount")));
			this.own(on(this.columnCount, "change", lang.hitch(this, "setColumnOffsetAndCount")));

		},

		setValue:function(model){
			var grid = model.grid;
			if (grid.type === "columns") {
				this.type.setValue("columns");
			} else {
				this.type.setValue("grid"); // fallback for null
			}

			this.setType(grid.type)
			this.gridHeight.value = grid.h;
			this.gridWidth.value = grid.w;
			this.gridVisible.setValue(grid.visible);
			this.gridSnap.setValue(grid.enabled);

			/**
			 * Set default values for old models:
			 * 12 columns
			 * 5% offset
			 * 7% column width
			 */
			if (grid.columnCount === undefined || grid.columnCount === null){
				var total = model.screenSize.w;
				grid.columnCount = this.defaultColumns;

				var offset = Math.floor(Math.round((total * 0.05)) / 10) * 10;
				grid.columnOffset = offset

				var width = Math.floor(Math.round((total * 0.07)) / 10) * 10;
				grid.columnWidth = width;

				var gutter = Math.floor((total - (2 * offset) - (this.defaultColumns * width)) / ( this.defaultColumns -1));
				grid.columnGutter = gutter;
			}

			this.columnCount.value = grid.columnCount;
			this.columnOffset.value = grid.columnOffset;
			this.columnGutter.value = grid.columnGutter;
			this.columnWidth.value = grid.columnWidth;

			this.model = model;
		},


		isValid:function(){
			var gutter = this.columnGutter.value * 1;
			var count = this.columnCount.value * 1;
			var offset = this.columnOffset.value * 1;
			var width = this.columnWidth.value * 1;
			var w = this.gridWidth.value * 1;
			var h = this.gridHeight.value * 1;
			return gutter >= 0 && count >= 0 && offset >=0 && width >= 0 && w >=0 && h >= 0;
		},

		getValue:function(){
			return  {
				h:this.gridHeight.value,
				w:this.gridWidth.value,
				columnCount:this.columnCount.value,
				columnOffset: this.columnOffset.value,
				columnGutter:this.columnGutter.value,
				columnWidth:this.columnWidth.value,
				type: this.type.getValue(),
				visible: this.gridVisible.getValue(),
				enabled: this.gridSnap.getValue()
			};
		},

		setType:function(type){
			this.logger.log(-1, "onChangeType", "enter > " +type);
			if (type === "columns") {
				css.add(this.gridCntr, "hidden");
				css.remove(this.columnCntr, "hidden");
			} else {
				css.remove(this.gridCntr, "hidden");
				css.add(this.columnCntr, "hidden");
			}

		},


		setColumnGutter:function(){
			this.logger.log(-1, "setColumnGutter", "enter > " + this.columnGutter.value);
			var gutter = this.columnGutter.value * 1;
			var count = this.columnCount.value * 1;
			var offset = this.columnOffset.value * 1;
			var width = this.columnWidth.value * 1;

			if (this.isInt(gutter) && this.isInt(count) && this.isInt(offset) && this.isInt(width)){
				var total = this.model.screenSize.w;
				// minus two times offset (left & right)
				total -= offset*2;
				// substract gutter space
				total -= gutter * (count-1)
				// change width
				this.columnWidth.value = Math.round(total / count);
			}
		},


		setColumnOffsetAndCount:function(){
			this.logger.log(-1, "setColumnOffsetAndCount", "enter > " + this.columnCount.value);

			var gutter = this.columnGutter.value * 1;
			var count = this.columnCount.value * 1;
			var offset = this.columnOffset.value * 1;
			var width = this.columnWidth.value * 1;

			if (this.isInt(gutter) && this.isInt(count) && this.isInt(offset) && this.isInt(width)){
				var total = this.model.screenSize.w;
				// minus two times offset (left & right)
				total -= offset*2;
				// make default gutter (space between rows)
				total -= this.defaultGutter * (count-1)

				this.columnGutter.value = this.defaultGutter;
				this.columnWidth.value = Math.round(total / count);
			} else {
				console.error("Bad Input")
			}
		},

		setColumnWidth:function(){
			this.logger.log(-1, "setColumnWidth", "enter > " + this.columnWidth.value);

			var gutter = this.columnGutter.value * 1;
			var count = this.columnCount.value * 1;
			var offset = this.columnOffset.value * 1;
			var width = this.columnWidth.value * 1;

			if (this.isInt(gutter) && this.isInt(count) && this.isInt(offset) && this.isInt(width)){
				var total = this.model.screenSize.w;
				// minus two times offset (left & right)
				total -= offset*2;
				// substract gutter space
				total -= width * (count)
				// change width
				this.columnGutter.value = Math.round(total / (count));
			}
		},




		makeInt:function(input){
			this.own(on(input, "change", lang.hitch(this, "validateInt", input)));
		},

		validateInt:function(input){
			var value = input.value;
			if (this.isInt(value)){
				css.remove(input, "VommondFormInputError");
			} else {
				css.add(input, "VommondFormInputError");
			}
		},

		isInt:function(value){
			 var er = /^-?[0-9]+$/;
			 return er.test(value);
		},
    },
    mounted () {
    }
}
</script>