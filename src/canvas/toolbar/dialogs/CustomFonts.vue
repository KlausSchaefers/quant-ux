
<template>
     <div class="MatcCustomFonts" @keydown.stop="" @keyup.stop="">
        <div class="MatcCustomFontsRow">
            <label class="MatcCustomFontsURL">URL</label>
            <label class="MatcCustomFontsName">Name</label>
             <span class="MatcCustomFontsIcon"></span>
        </div>
        <div v-for="(font, i) in fonts" :key="i" class="MatcCustomFontsRow MatcPaddingBottom">
            <input v-model="font.url" autocomplete="off" :placeholder="urlHint" class="form-control MatcIgnoreOnKeyPress MatcCustomFontsURL" @change="onChangeURL"/>
            <input v-model="font.name" autocomplete="off" class="form-control MatcIgnoreOnKeyPress MatcCustomFontsName" />
            <span class="MatcCustomFontsIcon mdi mdi-close-circle" @click="removeFont(font)"></span>
        </div>
        <div class="MatcButton" @click="addFont">Add</div>
	</div>
</template>
<style lang="scss">
 @import '../../../style/canvas/CustomFonts.scss';
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'

export default {
    name: 'CSSExporter',
    mixins:[DojoWidget],
    data: function () {
        return {
            urlHint:'e.g. <link href="https://fonts.googleapis.com/css2?family=Grey+Qo&display=swap" rel="stylesheet">',
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
                    } else {
                        let nameStart2 = f.url.indexOf('css2?family=')
                        if (nameStart2 > 0){
                            f.name = f.url.substring(nameStart2 + 'css2?family='.length)
                        }
                    }

                    if (f.name.indexOf("&")) {
                        f.name = f.name.substring(0, f.name.indexOf("&"))
                    }

                    if (f.name.indexOf("+")) {
                        f.name = f.name.replace("+", " ")
                    }
                   
                    console.debug(f, nameStart)
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