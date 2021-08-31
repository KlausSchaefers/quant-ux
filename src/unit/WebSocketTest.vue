<template>
  <div class="MatcLight">
    <h1>WebSocket Test</h1>
    <div class="MatcTReeCntr" v-for="client in clients" :key="client.id">
      <input v-model="client.message"/>
      <span class="MatcButton" @click="send(client)"> Send </span>
      <div v-for="(m,i) in client.messages" :key="i">
        {{m}}
      </div>
    </div>



  </div>
</template>

<style>
  @import url("../style/matc.css");
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

import CollabService from 'services/CollabService'
import Services from 'services/Services'


export default {
  name: "WebSocketTest",
  mixins: [],
  data: function() {
    return {
      clients: [
        {
          id: 1,
          app: '612d1379295894e6d2a8672e',
          send: '',
          messages: []
        },
        {
          id: 2,
          app: '612d1379295894e6d2a8672e',
          send: '',
          messages: []
        },
        {
          id: 3,
          app: '610af1d1295894e6d2a336ce',
          send: '',
          messages: []
        },
        {
          id: 4,
          app: '610af1d1295894e6d2a336ce',
          send: '',
          messages: []
        }
      ]
    }
  },
  components: {

  },
  methods: {
    send (client){
      console.debug('send()', client.message)
      client.service.send(client.message);
    }
  },
  mounted() {

    this.clients.forEach(client => {
      client.service = new CollabService('ws://localhost:8086', client.app, Services.getUserService().getToken())
      client.service.onMessage(message => {
        client.messages.push(message.data)
      })
    })



  }
};
</script>
