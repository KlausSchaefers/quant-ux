<template>
  <div class="MatcLight">
    <h1>Resize Test</h1>
    <div class="MatcTReeCntr">
        <Tree :value="tree" @select="onSelect"/>
    </div>
    {{selection}}


  </div>
</template>
<style lang="scss">
  @import "../style/matc.scss";
  @import "../style/qux.scss";
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
</style>

<script>

import Tree from 'common/Tree'

export default {
  name: "RukeTest",
  mixins: [],
  data: function() {
    return {
      tree: {
        id: "s1",
        name: 'Screen1',
        children: [
          {id: '1', label: '#1 Box 1', icon: ''},
          {id: '2', label: '#2 Box 2', icon: ''},
          {
            id: '3',
            label: '#3 Group 1',
            icon: '',
            openIcon: 'mdi mdi-folder-open',
            closeIcon: 'mdi mdi-folder',
            open: true,
            children: [
              {id: '3.1', label: '#3.1 Group 1 - Child 1', icon: ''},
              {id: '3.2', label: '#3.2 Group 1 - Child 2', icon: ''}
            ]
          },
          {
            id: '4',
            label: '#4 Group 2',
            icon: '',
            selected: true,
            open: true,
            children: [
              {id: '4.1', label: '#4.1 Group 2 - Child 1', icon: ''},
              {id: '4.2', label: '#4.2 Group 2 - Child 2', icon: ''},
              {
                id: '4.3',
                label: '#4.3 Group 2 - SubGroup 1',
                icon: '',
                open: false,
                children: [
                    {id: '4.3.1', label: '#4.3.1 SubGroup 1 - Child 1', icon: ''},
                ]
              }
            ]
          },
          {id: '5', label: '#5 Box 3', icon: ''},
        ]
      },
      selection: []
    };
  },
  components: {
    'Tree': Tree
  },
  methods: {
      onSelect (d) {
          this.selection = d
      }
  },
  mounted() {

  }
};
</script>
