<script>
import CheckBox from 'common/CheckBox'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import css from 'dojo/css'

export default {
    name: 'DataView',
    mixins:[],
    data: function () {
        return {
            hasDataView: false
        }
    },
    components: {},
    methods: {
        initDataView (){
            this.logger.log(0,"initDataView", "enter");
            
            this.dataViewCheckBox = this.$new(CheckBox);
			this.dataViewCheckBox.setLabel("Data");
			this.dataViewCheckBox.setValue(this.hasDataView);
			this.dataViewCheckBox.placeAt(this.dataViewCntr);
			this.own(on(this.dataViewCheckBox, "change", lang.hitch(this, "setDataView")));
        },
        setDataView (value) {
            this.logger.log(-1,"setDataView", "enter", value);
            if (value === true) {
                css.add(this.container, "MatcCanvasDataView");
                this.hasDataView = true
            } else {
                css.remove(this.container, "MatcCanvasDataView");
                this.hasDataView = false
                this.cleanDataView()
            }
            if (this.toolbar) {
                this.toolbar.setDataView(this.hasDataView)
            }
            // if we set mode, render will be called!
            this.rerender()
        },
        createWidgetDataView (widget, div) {
            if (this.hasDataView && widget) {
                var dataBinding = this.getDataBinding(widget);
                if (dataBinding) {
                    // console.debug('createWidgetDataView', widget.id, dataBinding)
                    if (!this._dataViewDivs) {
                        this._dataViewDivs = {}
                    }
                    /**
                     * Remove existing
                     */
                    if (this._dataViewDivs[widget.id]) {
                        let div = this._dataViewDivs[widget.id]
                        if (div.parentNode) {
                            div.parentNode.removeChild(div)
                        } 
                    }
                    css.add(div, 'MatcCanvasDataViewLabelCntr')
                    let dataDiv = document.createElement('div')
                    css.add(dataDiv, 'MatcCanvasDataViewLabel')
                    if (dataBinding && Object.keys(dataBinding).length > 0){
                        let txt = Object.values(dataBinding).join(', ')
                        dataDiv.innerHTML = txt
                    }
                    div.appendChild(dataDiv)
                    this._dataViewDivs[widget.id] = dataDiv
                }
                
            }
        },
        updateWidgetDataView (widget) {
            if (this.hasDataView && widget) {
                let div = this.widgetDivs[widget.id]
                if (div) {
                    this.createWidgetDataView(widget, div, true)
                }    
            }
        },
        cleanDataView () {
            this.logger.log(-1,"cleanDataView", "enter", this._dataViewDivs);
            for (let id in this._dataViewDivs) {
                let div = this._dataViewDivs[id]
                if (div.parentNode) {
                      css.remove(div.parentNode, 'MatcCanvasDataViewLabelCntr')
                    div.parentNode.removeChild(div)
                }
            }
            delete this._dataViewDivs
        }
    }, 
    mounted () {
    }
}
</script>