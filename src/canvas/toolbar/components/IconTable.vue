
<template>
    <div class="MatcIconTable ">
        <div class="MatcIconTableSearch">
			<input 
				class="MatcCreateSearch MatcIgnoreOnKeyPress form-control" 
				ref="inputSearch" 
				@keyup="onIconSearch"/>
		</div>
        <div class="MatcDateSectionIconCntr MatcDateSectionIconCntrOverflow">
            <table ref="table" @click.stop="setIcon">

            </table>
        </div>
       
    </div>
</template>
<style lang="scss">
    @import "../../../style/scss/icon_table.scss";
</style>
<style></style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import on from 'dojo/on'
import DomBuilder from '../../../common/DomBuilder'
import Services from 'services/Services'

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
            const table = this.$refs.table
			const icons = this.icons;
			this.cleanUpTempListener()

            table.innerHTML="";

			const none = this.db
				.span("MatcToolbarDropDownButtonItem MatcToolbarDropDownButtonItemRemove mdi mdi-cancel")
				.build(table);

			this.tempOwn(on(none, "click", () => {this.setNone()}))

			for (let j = 0; j < icons.length; j++) {
				const icon = icons[j];
				if(!filter || icon.indexOf(filter.toLowerCase()) >=0 ){
					const span = this.db
						.span("MatcToolbarDropDownButtonItem mdi mdi-"+icons[j])
						.build(table);

					span.setAttribute("data-matc-icon", icons[j]);
					if ('mdi mdi-' + icons[j] === selected) {
						this.focusIcon(span)
					}
				}
			}
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
			const node = e.target;
			if(node){
				const icon = node.getAttribute("data-matc-icon");
				if(icon){
                    css.add(node, 'selected')
					this.$emit('change', 'mdi mdi-' + icon)
				}
			}
		}
    },
    watch: {
    },
    async mounted() {
        this.icons = await Services.getSymbolService().getIcons()
        this.db = new DomBuilder()
        this.renderIconTable("", this.value)

		setTimeout(() => {
			this.$refs.inputSearch.focus()
		})
    }
}
</script>