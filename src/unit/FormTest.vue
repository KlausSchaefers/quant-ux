<template>
    <div class="MatcLight">
        <h1>Form Test</h1>

        <div class="conti">


            <div class="MatcToolbarRestSettingsHeader">
                <DropDownButton :options="methods" v-model="method" />

                <input v-model="url" class="form-control" placeholder="https://server.com/${databinding}.json" />

                <a class="MatcButton">Test</a>
            </div>

            <div class="form-group">
                <input v-model="url" class="form-control" placeholder="https://server.com/${databinding}.json" />

            </div>

            <div class="form-group">

                <DropDownButton :options="methods" v-model="method" />

            </div>

            <div class="col1">

                <Combo :value="method" :hints="methods" :fireOnBlur="true" :formControl="true" :isDropDown="true"
                    placeholder="Name of output variable" />

            </div>

            <div class="col1">
                <DropDownSelect
                                    :options="tableOptions" :l="$t('survey.options')"
             
                 ></DropDownSelect>
            </div>





            <div class="form-group MatcToolbarRestOutputHeaderType">

                <SegmentButton :options="methods" v-model="method" />
            </div>

            <div class="MatcButtonBar">
                <a class="MatcButton">Click</a>
                <a class="MatcButton MatcButtonPrimary">Click</a>
                
                <a class="MatcLinkButton">Click</a>
                <a  class="MatcButton MatcButtonSecondary">Download Task Summary</a>
            </div>

            <div class="">
                <a class="MatcButton">Click</a>
                <a class="MatcLinkButton">Click</a>
            </div>


        </div>

    </div>
</template>
  
<style lang="scss">
@import "../style/toolbar/all.scss";
@import "../style/matc.scss";

.conti {
    width: 600px;
    padding: 40px;
    margin: 60px;
    box-shadow: 0 0 12px rgba($color: #000000, $alpha: 0.5);
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>

<script>

import SegmentButton from 'page/SegmentButton'
import DropDownButton from 'page/DropDownButton'
import Input from 'common/Input'
import DropDownSelect from 'page/DropDownSelect'

export default {
    name: "FigmaTest",
    mixins: [],
    data: function () {
        return {
            url: '',
            method: "GET",
            methods: [
                {
                    label: "GET",
                    value: "GET"
                },
                {
                    label: "POST",
                    value: "POST"
                },
                {
                    label: "PUT",
                    value: "PUT"
                },
                {
                    label: "DELETE",
                    value: "DELETE"
                }
            ],
        };
    },
    components: {
        'SegmentButton': SegmentButton,
        'DropDownButton': DropDownButton,
        'DropDownSelect': DropDownSelect,
        'Combo': Input
    },
    computed: {
        tableOptions () {
        return [
            {value: 'showTasksSucess', label: this.$t('survey.taskSuccess'), check:true,},
            {value: 'showVideo', label: this.$t('survey.showVideo'), check:true},
            //{value: 'showId', label:this.$t('survey.ids'), check:true},
            //{css:"MatcDropDownButtonLine"},
            //{value: 'fullscreen', label: this.$t('survey.fullscreen'), event:'fullscreen', icon:' mdi mdi-chart-bar'},
            {css:"MatcDropDownButtonLine"},
            {value: 'download', label: this.$t('survey.download'), event:'download', icon:'mdi mdi-download-outline'}
          ]
      },
    },
    methods: {
        getPreview() {
        },
        onSelect(d) {
            this.selection = d
        },
        setAccessKey() {
            localStorage.setItem('quxFigmaTest', this.accessKey)
        },
        async run() {

        },
        mounted() {
            this.run()
        }
    }
};
</script>
  