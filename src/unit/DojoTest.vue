<template>
  <div class="home">
    <h1>Dojo Test Cases</h1>
    <!-- checkbox -->
    <div class="TestBox">Here is a CheckBox
      <CheckBox @change="onChangeCheckBox"/>
      <CheckBox @change="onChangeCheckBox" v-model="checkBoxChecked" label="Another check"/> {{checkBoxChecked}}
      <div id="testCheckBox"/>
    </div>
    <!-- DropDown -->
    <div class="TestBox">Here is a DropDownButton
      <DropDownButton @change="onChangeDropBox" l="Drop 1" :options="options"/>
      <div id="testDropDownBox"/>
    </div>
    <!-- Dialog -->
    <div class="TestBox">Here is a Dialog
      <div class="MatcButton" @click="showDialog()">Show Dialog</div>
    </div>
    <!-- Request -->
    <div class="TestBox">Request
      <div class="MatcButton" @click="requestUser()">Request User</div>
      {{user}}
    </div>
    <!-- Form -->
    <div class="TestBox">Form
      <div id="testForm"/>
    </div>


    <!-- Form -->
    <div class="TestBox">Scroll Container
      <div id="testScrollContainer" style="height:300px"/>
    </div>


        <!-- Slider -->
    <div class="TestBox">Slider
      <div style="height:30px">
       <HSlider @change="onSliderChange"/>
      </div>
       <div style="height:30px" id="testSlider" />
    </div>


     <!-- Color -->
    <div class="TestBox">ColorPixcker

       <div style="height:30px" id="testColorPicker" />
    </div>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style lang="css">

.TestBox {
  display: inline-block;
  width: 300px;
  height: 400px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  padding: 10px;
  vertical-align: top;
}

.VommondDropDownButton {
  border: 1px solid #999;
  padding: 5px;
}

.VommondDropDownButton ul {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  background: #fff;
  margin: 0px;
}

.ScrollContainer{
  height: 800px;
  background: red;
}
</style>

<script>
import CheckBox from "common/CheckBox.vue";
import DropDownButton from "common/DropDownButton";
import DojoWidget from "dojo/DojoWidget";
import Dialog from "common/Dialog";
import HSlider from "common/HSlider";
import Form from "common/Form";
import DomBuilder from "common/DomBuilder";
import ScrollContainer from "common/ScrollContainer";
import on from "dojo/on";
import Mixin from './Mixin'
import ToolbarColor from 'canvas/toolbar/components/ToolbarColor'


export default {
  name: "home",
  mixins: [DojoWidget, new Mixin()],
  data: function() {
    return {
      checkBoxChecked: true,
      options: [{ label: "a", value: "a" }, { label: "b", value: "b" }],
      user: "not loaded"
    };
  },
  components: {
    CheckBox: CheckBox,
    DropDownButton: DropDownButton,
    'HSlider': HSlider
  },
  methods: {
    onChangeCheckBox(value) {
      console.debug("Home.onChangeCheckBox", value);
    },
    onChangeCheckBoxDojo(value) {
      console.debug("Home.onChangeCheckBoxDojo", value);
    },
    testCheckBox() {
      console.debug("testCheckBox() > enter");
      var s = this.$new(CheckBox);
      s.placeAt("testCheckBox");

      on(s, "change", function(value) {
        console.debug("Fucntion onChange", value);
      });

      s.on("change", function(value) {
        console.debug("Fucntion 2 onChange", value);
      });
    },
    onChangeDropBox(value, e) {
      console.debug("onChangeDropBox", value, e);
    },
    testDropDownButton() {
      console.debug("testDropDownButton() > enter");
      var d = this.$new(DropDownButton);
      d.setLabel("Drop");
      d.setOptions(this.options);
      d.placeAt("testDropDownBox");

      on(d, "change", function(value, e) {
        console.debug("testDropDownButton() >> onChange", value, e);
      });
    },
    showDialog() {
      console.debug("showDialog() > enter");
      let d = new Dialog();
      let node = document.createElement("div");
      node.innerHTML = "Test Dialog";
      d.popup(node);
      d.on("close", () => {
        console.debug("showDialog() > Callback on close");
      });
    },
    requestUser() {
      console.debug("requestUser() > enter");
      let u = this._doGet("/rest/user");
      this.user = u.role;
      this._doGet("/rest/user", user => {
        this.user += " " + user.id;
      });
    },
    testForm() {
      console.debug("testForm() > enter");
      let f = this.$new(Form);
      f.placeAt("testForm");
      f.render(
        [
          {
            label: "Email",
            name: "email",
            type: "text",
            required: "true",
            placeholder: this.getNLS("dialog.login.email.placeholder"),
            css: "input-lg",
            error: this.getNLS("dialog.login.email.error"),
            focus: true
          },
          {
            label: this.getNLS("dialog.login.password.label"),
            name: "password",
            type: "password",
            min: 6,
            placeholder: this.getNLS("dialog.login.password.placeholder"),
            css: "input-lg",
            error: this.getNLS("dialog.login.password.error"),
            onEnter: function (data) {
              console.debug('from enter', data)
            },
            feedback: {
              label: this.getNLS("dialog.login.password.reset"),
              callback: function() {
                console.debug("from() reset");
              }
            }
          }
        ],
        [
          {
            label: this.getNLS("btn.login"),
            css: "MatcButton",
            click: function(data) {
              console.debug("from login", data);
            }
          },
          { label: this.getNLS("btn.cancel"), css: "MatcLinkButton", click: function() {
            console.debug('form cancel')
          }}
        ]
      );
    },
    testSlider () {
      console.debug('testSlider() > enter')
      var d = this.$new(HSlider);
      d.placeAt("testSlider");
      on(d, "change", function(value, e) {
        console.debug("testSlider() >> onChange", value, e);
      });
    },
    onSliderChange (v) {
      console.debug('onSliderChange', v)
    },
    testScrollContainer() {
      console.debug('testScrollContainer() enter')

      let db = new DomBuilder()
      let n = db.div('ScrollContainer', 'This should be scrollable').build()
      let s = this.$new(ScrollContainer)
      s.placeAt('testScrollContainer');
      s.wrap(n)
    },
    testColorPicker () {
      let c = this.$new(ToolbarColor)
      c.setLabel('<span class="MatcToolbarColorIndicator"></span>');
      c.setValue('#333')
      c.placeAt("testColorPicker")
      console.debug('ToolbarColor', c)
    }
  },
  mounted() {
    for (let key in this) {
      if (key.indexOf("test") === 0) {
        this[key]();
      }
    }
  }
};
</script>
