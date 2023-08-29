<template>
  <div class="MatcLight">
    <h1>SmallFont Test</h1>

  <div :style="'font-size:' + s + 'px' " v-for="s in sizes" :key="s"> Test {{s}}</div>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

  .MatcTReeCntr {
      background: #f2f2f2;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      display: inline-block;
      padding: 5px;
      width: 250px;
      height: 400px;
      overflow: scroll;
      margin-left: 30px;
      font-size: 14px;
  }
  .MatcPreviewCntr {
      background: #f2f2f2;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
      display: inline-block;
      width: 250px;
      height: 400px;
      overflow: scroll;
      margin-left: 30px;
      font-size: 14px;
      vertical-align: top;
      overflow: auto;
      border-radius: 10px;
  }
</style>

<script>

export default {
  name: "SmallFontTest",
  mixins: [],
  data: function() {
    return {
        files: [],
        previews: [],
        sizes: [0.5, 0.7, 1, 2, 3,4,5,6,7,8,9,10,11,12],
        model: null
    };
  },
  components: {

  },
  computed: {
    screens () {
      if (this.model) {
        return Object.values(this.model.screens)
      }
      return null
    },
    width () {
      if (this.model) {
        return this.model.screenSize.w + 'px'
      }
      return 0
    },
    height () {
      if (this.model) {
        return this.model.screenSize.h + 'px'
      }
      return 0
    }
  },
  methods: {
      getPreview() {
      },
      onSelect (d) {
          this.selection = d
      },
      async run() {

      }
  },
  mounted() {
      this.run()
  }
};
</script>
