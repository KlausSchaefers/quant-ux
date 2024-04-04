
<template>
    <div class="MatcIconTable ">
        <div class="MatcIconTableSearch">
			<div class="form-group has-feedback">
				<input 
				class="MatcCreateSearch MatcIgnoreOnKeyPress form-control" 
				ref="inputSearch" 
				@keyup="onIconSearch"/>
				<span class="mdi mdi-magnify  form-control-feedback MatcCreateSearchBtn " aria-hidden="true" data-dojo-attach-point="searchRemoveBtn"></span>
			</div>
			
		</div>
        <div class="MatcDateSectionIconCntr MatcDateSectionIconCntrOverflow MatcScrollContainer">
            <div ref="table" @click.stop="setIcon">

            </div>
        </div>
       
    </div>
</template>
<style lang="scss">
    @import "../../../style/components/icon_table.scss";
</style>
<style></style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import on from 'dojo/on'
import DomBuilder from '../../../common/DomBuilder'
import Services from 'services/Services'
import {wrapIcon} from 'page/QIconUtil'
export default {
    name: 'IconTable',
    mixins: [DojoWidget],
    props: ["value"],
    data: function () {
        return {
            icons : []
        }
    },
    components: {
    },
    methods: {
        getSelectedIcon (iconKey= 'icon') {
			if (this.widget && this.widget.style) {
				return this.widget.style[iconKey]
			}
		},

		renderIconTable (filter, selected = false){
			if (this.isSVG) {
				this.renderSVGIconTable(filter, selected)
			} else {
				this.renderMDIIconTable(filter, selected)
			}
			
		},

		renderMDIIconTable (filter, selected = false){
            const table = this.$refs.table
			const icons = this.icons;
			this.cleanUpTempListener()

            table.innerHTML="";

			const cntr = this.db.div().build()

			const none = this.db
				.span("MatcToolbarDropDownButtonItem MatcToolbarDropDownButtonItemRemove mdi mdi-cancel")
				.build(cntr);

			this.tempOwn(on(none, "click", () => {this.setNone()}))

			for (let j = 0; j < icons.length; j++) {
				const icon = icons[j];
				if(!filter || icon.indexOf(filter.toLowerCase()) >=0 ){
					const span = this.db
						.span("MatcToolbarDropDownButtonItem mdi mdi-"+icons[j])
						.build(cntr);

					span.setAttribute("data-matc-icon", icons[j]);
					if ('mdi mdi-' + icons[j] === selected) {
						this.focusIcon(span)
					}
				}
			}

			table.appendChild(cntr)
		},

		renderSVGIconTable (filter, selected = false){
			console.debug('renderSVGIconTable')
            const table = this.$refs.table
			const icons = this.icons;
			this.cleanUpTempListener()

            table.innerHTML="";

			const cntr = this.db.div().build()

			const none = this.db
				.span("MatcToolbarDropDownButtonItem MatcToolbarDropDownButtonItemRemove mdi mdi-cancel")
				.build(cntr);

			this.tempOwn(on(none, "click", () => {this.setNone()}))

			for (let icon in this.icons) {
				if(!filter || icon.indexOf(filter.toLowerCase()) >=0 ){
					let span = this.db.span("MatcToolbarDropDownButtonItem mdi").build(cntr);
					span.setAttribute("data-matc-icon", icon);

					const wrapper = this.db.span('').build(span)
					wrapper.setAttribute("data-matc-icon", icon);
					wrapper.innerHTML  = wrapIcon(icons[icon])

					if (this.icons[icon] === selected) {
						this.focusIcon(span)
					}
				}
			}

			table.appendChild(cntr)
		},

		focusIcon (span) {
			css.add(span, 'selected')
			setTimeout( () => {
				span.scrollIntoView({block: "nearest", inline: "nearest"})
			}, 100)
		},

		onIconSearch (){
			const filter = this.$refs.inputSearch.value
			if(filter.length >= 3){
				this.renderIconTable(filter, this.value);
			} else {
				this.renderIconTable("", this.value);
			}
		},

        onBack () {
            this.$emit('cancel')
        },

		setNone () {
			this.$emit('change', '')
		},

		setIcon (e){
			if (this.isSVG) {
				this.setSVGIcon(e)
			} else {
				this.setMDIIcon(e)
			}
		},

		setMDIIcon (e){
			const node = e.target;
			if(node){
				const icon = node.getAttribute("data-matc-icon");
				if(icon){
                    css.add(node, 'selected')
					this.emit('change', 'mdi mdi-' + icon)
					this.$emit('change', 'mdi mdi-' + icon)
				}
			}
		},

		setSVGIcon (e){
			let node = e.target;
			if(node){
				let icon = node.getAttribute("data-matc-icon");
				if (!icon && node.parentNode) {
					node = node.parentNode
					icon = node.getAttribute("data-matc-icon");
				}

				if(icon){
					const svg = this.icons[icon]
                    css.add(node, 'selected')
					this.emit('change', svg)
					this.$emit('change', svg)
				}
			}
		}
    },
    watch: {
    },
    async mounted() {
		if (this.isSVG) {		
			this.icons = await Services.getSymbolService().getSVGIcons()
		} else {
			this.icons = await Services.getSymbolService().getIcons()
		}

        this.db = new DomBuilder()

		setTimeout(() => {
			this.renderIconTable("", this.value)
			this.$refs.inputSearch.focus()
		}, 400)
    }
}
</script>