<script>
import CheckBox from 'common/CheckBox'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import css from 'dojo/css'
import RestEngine from 'core/RestEngine'

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
                let label = ''
                var dataBindings = this.getAllDataBinding(widget);
                if (dataBindings && dataBindings.length > 0) {
                    label = dataBindings.join(', ') + ' '
                }

                if (widget.props && widget.props.callbacks) {
                    if (widget.props.callbacks.click) {
                        label += ` ${widget.props.callbacks.click}`
                    }
                }

                if (label) {
                    if (!this._dataViewDivs) {
                        this._dataViewDivs = {}
                    }
                    if (this._dataViewDivs[widget.id]) {
                        let div = this._dataViewDivs[widget.id]
                        if (div.parentNode) {
                            div.parentNode.removeChild(div)
                        } 
                    }

                    css.add(div, 'MatcCanvasDataViewLabelCntr')
                    let dataDiv = document.createElement('div')
                    css.add(dataDiv, 'MatcCanvasDataViewLabel')
                    dataDiv.innerHTML = label
                    div.appendChild(dataDiv)
                    this._dataViewDivs[widget.id] = dataDiv
                }
                
            }
        },

        getAllDataBinding (widget) {
            let result = []
            let dataBinding = this.getDataBinding(widget)
            if (dataBinding) {
                result = Object.values(dataBinding)
            }
             /**
             * Rest needs special handling
             */
            if (widget.props && widget.props.rest) {
                let rest = widget.props.rest
                let restBindings = RestEngine.getNeededDataBings(rest)
                result = result.concat(restBindings)
                if (rest.output && rest.output.databinding) {
                    result.push(rest.output.databinding)
                }
            }
            /**
             * Logic Widgets have the batabinding in the lines
             */
            if (widget.type === 'LogicOr') {
                let fromLines = this.getFromLines(widget)
                fromLines.forEach(line => {
                    if (line.rule && line.rule.databinding) {
                        result.push(line.rule.databinding)
                    }
                })
            }
            return result
        },

        updateWidgetDataView (widget) {
            if (this.hasDataView && widget) {
                this.logger.log(-1,"updateWidgetDataView", "enter", widget.name);
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