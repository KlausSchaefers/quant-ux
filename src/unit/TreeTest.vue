<template>
  <div class="MatcLight">
    <h1>Resize Test</h1>
    <div class="MatcTReeCntr">
        <Tree :value="tree"/>
    </div>


  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
  .MatcTReeCntr {
      background: white;
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
        name: 'Screen1',
        children: [
          {id: '1', label: 'Box 1', icon: ''},
          {id: '2', label: 'Box 2', icon: ''},
          {
            id: '3',
            label: 'Group 1',
            icon: '',
            children: [
              {id: '4', label: 'Group 1 - Child 1', icon: ''},
              {id: '5', label: 'Group 1 - Child 2', icon: ''}
            ]
          },
          {
            id: '6',
            label: 'Group 2',
            icon: '',
            children: [
              {id: '7', label: 'Group 2 - Child 1', icon: ''},
              {id: '8', label: 'Group 2 - Child 2', icon: ''},
              {
                id: '9',
                label: 'Group 2 - SubGroup 1',
                icon: '',
                children: [
                    {id: '10', label: 'SubGroup 1 - Child 1', icon: ''},
                ]
              }
            ]
          }
        ]
      }
    };
  },
  components: {
    'Tree': Tree
  },
  methods: {
      onChange (d) {
          this.settings = d
      }
  },
  mounted() {

  }
};
</script>
