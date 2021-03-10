
<template>
    <div class=""  @mousedown.stop="" >
      <div :class="[']MatcToolbarSection', {'MatcToolbarSectionCollabsed' : !visible.color}]">
        <div class=" MatcToolbarSectionLabel" @click.stop="toggleSection('color')">Colors</div>
        <div class=" MatcToolbarSectionContent">

          <div class="MatcToolbarItem MatcToolbarGridFull" v-for="designtoken in colorTokens" :key="designtoken.id">

             <span data-dojo-attach-point="icon" class="MatcToolbarColorIndicator" :style="{'background' : designtoken.value}"></span>

            <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
          </div>

        </div>
      </div>

       <div :class="[']MatcToolbarSection', {'MatcToolbarSectionCollabsed' : !visible.text}]">
        <div class=" MatcToolbarSectionLabel" @click.stop="toggleSection('text')">Text</div>
        <div class=" MatcToolbarSectionContent">

          <div class="MatcToolbarItem MatcToolbarGridFull" v-for="designtoken in textTokens" :key="designtoken.id">
             <span class="MatcToolbarItemIcon">
              <span class="mdi mdi-cogs" />
            </span>
            <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
          </div>

        </div>
      </div>

      <div :class="[']MatcToolbarSection', {'MatcToolbarSectionCollabsed' : !visible.stroke}]">
        <div class=" MatcToolbarSectionLabel" @click.stop="toggleSection('stroke')" >Strokes</div>
        <div class=" MatcToolbarSectionContent">

          <div class="MatcToolbarItem MatcToolbarGridFull" v-for="designtoken in strokeTokens" :key="designtoken.id">
             <span class="MatcToolbarItemIcon">
              <span class="mdi mdi-cogs" />
            </span>
            <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
          </div>

        </div>
      </div>

      <div :class="[']MatcToolbarSection', {'MatcToolbarSectionCollabsed' : !visible.shadow}]">
        <div class=" MatcToolbarSectionLabel" @click.stop="toggleSection('shadow')" >Shadows</div>
        <div class=" MatcToolbarSectionContent">

          <div class="MatcToolbarItem MatcToolbarGridFull" v-for="designtoken in shadowTokens" :key="designtoken.id">
             <span class="MatcToolbarItemIcon">
              <span class="mdi mdi-cogs" />
            </span>
            <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
          </div>

        </div>
      </div>

      <div :class="[']MatcToolbarSection', {'MatcToolbarSectionCollabsed' : !visible.padding}]">
        <div class=" MatcToolbarSectionLabel" @click.stop="toggleSection('padding')" >Padding</div>
        <div class=" MatcToolbarSectionContent">

          <div class="MatcToolbarItem MatcToolbarGridFull" v-for="designtoken in paddingTokens" :key="designtoken.id">
             <span class="MatcToolbarItemIcon">
              <span class="mdi mdi-cogs" />
            </span>
            <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
          </div>

        </div>
      </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
//import Util from 'core/Util'

export default {
    name: 'DesignTokenBtn',
    mixins:[DojoWidget],
    data: function () {
        return {
           model: null,
           visible: {
             color: true,
             text: true,
             shadow:true,
             stroke:true,
             padding:true
           }
        }
    },
    computed: {
      colorTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'color') {
              result.push(token)
            }
          }
        }
        return result
      },
      textTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'text') {
              result.push(token)
            }
          }
        }
        return result
      },
      shadowTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'boxShadow') {
              result.push(token)
            }
          }
        }
        return result
      },
      strokeTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'stroke') {
              result.push(token)
            }
          }
        }
        return result
      },
      paddingTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'stroke') {
              result.push(token)
            }
          }
        }
        return result
      }
    },
    components: {},
    methods: {
      toggleSection (s) {
        this.visible[s] = !this.visible[s]
      },
      setModel (m) {
        this.model = m
      }

    },
    mounted () {
    }
}
</script>