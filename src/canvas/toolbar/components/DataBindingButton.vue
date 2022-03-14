
<template>
     <div class="MatcToobarRow MatcAction" @click.stop="onOpenDialog" v-if="!isDataView">
		<div class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarGridFull">
			<span :class="'MatcToolbarSmallIcon mdi ' + icon "></span>
			<span class="MatcToolbarDropDownButtonLabel">{{label}}</span>
		</div>
	</div>
    <div v-else class="">
        <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarInputIconCntr" v-for="variable in dataBindingVars" :key="variable.value">


            <Combo
                :fireOnBlur="true"
                :top="false"
                :placeholder="variable.label"
                :toolbar="true"
                :inline="true"
                :hints="getHints()"
                :actions="actions"
                :value="getDataBindingValue(variable.value)"
                @focus="hasNewTypeSelector = true"
                @change="onChangeVaribale(variable.value, $event)"
                @more="onOpenDialog"
				:formControl="false"/>

            <span class="mdi mdi-database MatcToobarInputIcon" @click.stop="onOpenDialog(variable)" />

	    </div>


    </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import Logger from 'common/Logger'
import _Tooltip from 'common/_Tooltip'
import DataBindingService from 'services/DataBindingService'
import Input from 'common/Input'
import Util from 'core/Util'


export default {
    name: 'DataBindingButton',
    mixins:[_Tooltip, Util, DojoWidget],
    data: function () {
        return {
            model: null,
            widget: null,
            isDataView: false
        }
    },
    components: {
        'Combo': Input
    },
    computed: {
        actions () {
            return [
                {
                    label: 'More...',
                    value: 'More...',
                    css:'MatcToobarInputAction',
                    action: 'more'
                }
            ]
        },
        dataBindingVars () {
            return DataBindingService.getDefautlBindings(this.widget)
        },
        icon () {
            let dataBinding = this.getDataBinding(this.widget);
			if(dataBinding && Object.keys(dataBinding).length > 0){
				return "mdi mdi-database";
            }
            return 'mdi mdi-database-plus'
        },
        label () {
            let dataBinding = this.getDataBinding(this.widget);
			if(dataBinding && Object.keys(dataBinding).length > 0){
			    return Object.values(dataBinding).join(', ')
            }
            return 'Add Data Binding'
        }
    },
    methods: {
        getHints () {
            let hints = DataBindingService.getAllBindingPaths(this.model)
            hints = hints.map(h => {
				return {
					label: h,
					value: h
				}
            })
            return hints
        },
        onChangeVaribale (key, value) {
            let dataBinding = lang.clone(this.getDataBinding(this.widget));
            if (!dataBinding) {
                dataBinding = {}
            }
            if (value !== undefined) {
                dataBinding[key] = value
                this.emit('change', dataBinding)
            }
        },
        getDataBindingValue (key) {
            var dataBinding = this.getDataBinding(this.widget);
			if(dataBinding){
                return dataBinding[key]
            }
            return ''
        },
        setModel (m) {
            this.model = m
        },
        setDataView (isDataView) {
            this.isDataView = isDataView
        },
        setWidget(w) {
            this.widget = w
        },
        onOpenDialog (variable) {
            console.debug('onOpenDialog', variable)
            this.emit('showDialog', variable)
        }
    },
    mounted () {
        this.logger = new Logger('DataBindingButton')
    }
}
</script>