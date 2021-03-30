
<template>
     <div class="MatcCustomFonts" @keydown.stop="" @keyup.stop="">
        <div class="MatcCustomFontsRow">
            <label class="MatcCustomFontsName">Name</label>
            <label class="MatcCustomFontsURL">URL</label>
        </div>
        <div v-for="(font, i) in fonts" :key="i" class="MatcCustomFontsRow MatcPaddingBottom">
            <input v-model="font.name" autocomplete="off" class="form-control MatcIgnoreOnKeyPress MatcCustomFontsName" />
            <input v-model="font.url" autocomplete="off" class="form-control MatcIgnoreOnKeyPress MatcCustomFontsURL" @change="onChangeURL"/>
            <span class="mdi mdi-close-circle" @click="removeFont(font)"></span>
        </div>
        <div class="MatcButton" @click="addFont">Add</div>
	</div>
</template>
<style>
 @import url('../../../style/CustomFonts.css');
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'

export default {
    name: 'CSSExporter',
    mixins:[DojoWidget],
    data: function () {
        return {
			fonts: [{
                name: '',
                url: ''
            }]
        }
    },
    components: {},
    methods: {
        getFonts () {
            return this.fonts.filter(f => f !== null);
        },
        addFont () {
            this.fonts.push({
                name: '',
                url: '',
                type:'truetype'
            })
        },
        removeFont (font) {
            this.fonts = this.fonts.filter(f => f && f.name != font.name)
        },
        setModel (m) {
            if (m.fonts) {
                this.fonts = lang.clone(m.fonts).filter(f=> f !== null)
            }
        },
        onChangeURL () {

            this.fonts.forEach(f => {
                // parse something like <link href="https://fonts.googleapis.com/css?family=Stylish" rel="stylesheet">
                if (f.url.indexOf('<link') === 0 ){
                    let start = f.url.indexOf('href="')
                    let end = f.url.indexOf('"', start+6)
                    f.url = f.url.substring(start+6, end)
                    f.type = 'import'
                    /**
                     * TODO: Make here a loop for other font providers than google
                     */
                    let nameStart = f.url.indexOf('css?family=')
                    if (nameStart > 0){
                        f.name = f.url.substring(nameStart + 'css?family='.length)
                    }
                } else if (f.url.indexOf('.ttf') > 0){
                    f.type = 'truetype'
                }
            })
        }
    },
    mounted () {
    }
}
</script>