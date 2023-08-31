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

                <DropDownButton :options="methods" v-model="method" />

            </div>

            <div class="col1">

                <Combo :value="method" :hints="methods" :fireOnBlur="true" :formControl="true" :isDropDown="true"
                    placeholder="Name of output variable" />

            </div>



            <div class="form-group MatcToolbarRestOutputHeaderType">

                <SegmentButton :options="methods" v-model="method" />
            </div>

            <div class="MatcButtonBar">
                <a class="MatcButton">Click</a>
                <a class="MatcLinkButton">Click</a>
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
        'Combo': Input
    },
    computed: {
        screens() {
            if (this.model) {
                let screens = Object.values(this.model.screens)
                if (screens.length > 10) {
                    screens = screens.slice(0, 10)
                }
                return screens
            }
            return []
        },
        width() {
            if (this.model && this.model.screenSize) {
                return this.model.screenSize.w + 'px'
            }
            return 0
        },
        height() {
            if (this.model && this.model.screenSize) {
                return this.model.screenSize.h + 'px'
            }
            return 0
        }
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
  