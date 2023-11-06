<template>
    <ZoomDialog ref="dialog" overflow="visible">
        <div class="MatcDialog MatcTeamDialog MatcResizeDialog">
    
          <table class="">
            <thead>
                <tr>
                    <th>

                    </th>
                    <th>
                        Owner
                    </th>
                    <th>
                        Write
                    </th>
                    <th>
                        Read
                    </th>
                    <th>
                        Delete
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in team" :key="user.id">
                    <td>
                        {{getUserName(user)}}
                    </td>
                    <td>
                        <RadioBox :selected="user.permission  === 3" @change="setOwner(user)"/>
                    </td>
                    <td>
                        <RadioBox :selected="user.permission === 2" @change="setWrite(user)" v-if="user.permission < 3"/>
                    </td>
                    <td>
                        <RadioBox :selected="user.permission === 1" @change="setRead(user)" v-if="user.permission < 3"/>
                    </td>
                    <td>
                        <div class="MatcButton MatcButtonXXS MatcButtonDanger MatcButtonSecondary" v-if="user.permission < 3">
                            <QIcon icon="DeleteX"/>
                        </div>
                    </td>
                </tr>

             
            </tbody>

          </table>

          <div class="form-group MatcMarginTopXL">
            <Combo formControl="true" placeholder="Add new member" :hints="hints"></Combo>
    
          </div>
       
            
          <div class="MatcButtonBar MatcMarginTopXXL">
            <a class="MatcButton MatcButtonPrimary" @click="save">Save</a>
            <a @click="close" class="MatcLinkButton">Cancel</a>
          </div>
  

        </div>

    </ZoomDialog>

  </template>
  <script>
  import Logger from "common/Logger";
  import ZoomDialog from 'common/ZoomDialog'
  //import TeamMember from './TeamMember'
  import Input from "common/Input";
  import RadioBox from "common/RadioBox";
  import QIcon from "page/QIcon";
  import Services from "services/Services";

  export default {
    name: "TeamDialog",
    props:['appID'],
    mixins: [],
    data: function() {
      return {
        errorMessageName: '',
        name: "",
        team: [],
        hints: []
      };
    },
    watch: {},
    components: {
        'ZoomDialog': ZoomDialog,
        'RadioBox': RadioBox,
        'Combo': Input,
        //TeamMember,
        'QIcon': QIcon
    },
    methods: {
        close () {
            this.$refs.dialog.close()
        },
        show (team, e) {
            this.team = team
            this.$refs.dialog.show(e.target)
        },
        save () {

        },
        setWrite (user) {
            console.debug('Write', user)
            user.permission = 2
        },
        setRead (user) {
            console.debug('Read', user)
            user.permission = 1
        },
        getUserName (user) {
            let result = "";
            if (user.name) {
                result = user.name + " ";
            }
            if (user.lastname) {
                result += user.lastname;
            }
            if (result.length == 0) {
                result = user.email;
            }
            return result;
        },
        setTeamSuggestions  (data) {
            var ids = {};
            for (let i = 0; i < this.team.length; i++) {
                ids[this.team[i].id] = true;
            }

            var hints = [];
            for (let i = 0; i < data.length; i++) {
                var user = data[i];
                if (!ids[user.id]) {
                var option = { label: "", value: user.email };

                if (user.name) {
                    option.label += user.name + " ";
                }

                if (user.lastname) {
                    option.label += user.lastname + " ";
                }

                if (option.label.length > 0) {
                    option.label += " - ";
                }

                option.label += user.email;
                if (user.image) {
                    option.image = user.image;
                }
                hints.push(option);
                }
            }
            this.hints = hints
        },
    },
    async mounted() {
      this.logger = new Logger("TeamDialog");
      let suggestions = await Services.getModelService().findTeamSuggestions(
        this.appID
      );
      this.setTeamSuggestions(suggestions)
    //   setTimeout(() => {
    //     if (this.$refs.inputName) {
    //       this.$refs.inputName.focus()
    //     }
    //   }, 50)
    }
  };
  </script>
  
  
  