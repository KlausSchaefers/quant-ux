<template>
  <div class="MatcLight">
    <h1>WebSocket Test</h1>
    <div class="MatcTReeCntr" v-for="client in clients" :key="client.id">
      <input v-model="client.message" v-if="!client.error"/>
      <span class="MatcButton" @click="send(client)"> Send </span>
      <div v-for="(m,i) in client.messages" :key="i">
        {{m}}
      </div>
    </div>



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

import WebSocketService from 'services/WebSocketService'
import Services from 'services/Services'
import { v4 as uuidv4 } from 'uuid';


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
          messages: [],
          error: false
        },
        {
          id: 2,
          app: '612d1379295894e6d2a8672e',
          send: '',
          messages: [],
          error: false
        },
        {
          id: 3,
          app: '610af1d1295894e6d2a336ce',
          send: '',
          messages: [],
          error: false
        },
        {
          id: 4,
          app: '610af1d1295894e6d2a336ce',
          send: '',
          messages: [],
          error: false
        }
      ]
    }
  },
  components: {

  },
  methods: {
    send (client){
      console.debug('send()', client.message)
      client.service.send({
        type: 'chat',
        id: uuidv4(),
        message: client.message
      });
    }
  },
  mounted() {

    this.clients.forEach(client => {
      // ws://localhost:8086
      client.service = new WebSocketService('ws://localhost:8086', client.app, Services.getUserService().getToken())
      client.service.onMessage(message => {
        client.messages.push(message)
      })
      client.service.onError(() => {
        client.error =  true
      })
      client.service.init()
    })



  }
};
</script>
