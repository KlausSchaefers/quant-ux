
<template>
    <div class="MatcHelp">
        <div class="MatcHelpContent">
            <span v-if="loading" class="MatchHint">
                Loading...
            </span>
            <div v-else class="MatcHelpContentCntr">
                <h2>{{current.title}}</h2>
                <p v-html="current.body" class="MatcHelpContentParagraph"></p>
                
                
                <iframe
                    v-if="current.video" 
                    :width="560 * 1.2" 
                    :height="315 * 1.2" 
                    :src="current.video.src" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                </iframe>

                <div v-if="current.hasContact">
                    <div class="form-group">
                        <label>Name</label>
                        <input class="form-control input-lg MatcIgnoreOnKeyPress"  v-model="contactName"/>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input class="form-control input-lg MatcIgnoreOnKeyPress" v-model="contactEmail"/>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea class="form-control input-lg MatcIgnoreOnKeyPress" v-model="contactMessage"/>
                    </div>
                 
                    <div class=" MatcButtonBar MatcMarginTopXXL">
                        <div class="MatcButton" @click="sendContact">Send</div>
                        <span class="MatcError"> 
                            {{contactError}}
                        </span>
                        <span class="MatcSuccess"> 
                            {{concatSucess}}
                        </span>
                    </div>
                </div>

                <div v-for="p in current.paragraphs" :key="p.id" :pid="p.id" ref="paragraph" class="MatcHelpContentParagraph">
                    <h3 v-if="p.title">
                        {{p.title}}
                    </h3>
                    <p v-html="p.body"></p>

                     <iframe
                        v-if="p.video" 
                        :width="560 * 1.2" 
                        :height="315 * 1.2" 
                        :src="p.video.src" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>

                </div>
           
            </div>
        </div>
        <div class="MatcHelpTopics" v-if="hasSideBar">
            <div>
              	<input type="search" class=" MatcCreateSearch MatcIgnoreOnKeyPress form-control" placeholder="Search" v-model="search"/>
            </div>
            <span v-if="loading" class="MatchHint">
                Loading...
            </span>
            <div class="MatcHelpTopicsCntr">
                <template v-for="topic in topics" > 
                    <a @click="setTopic(topic.id)" :class="{'selected': topic.id === selected && !selectedParagraph}" :key="topic.id">
                        {{topic.name}}
                    </a>
                    <template v-if="topic.id === selected">
                        <a  v-for="(p, i) in topic.paragraphs" :key="i" :class="['MatcHelpSubTopic', {'selected': p.id === selectedParagraph}]" @click.stop="setSupTopic(p.id)">
                            {{p.title}}
                        </a>
                    </template>
                </template>
            </div>
        </div>
    </div>
</template>
<style scoped>
textarea {
    height: 200px;
}
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Services from 'services/Services'
import Vue from 'vue'

export default {
    name: 'HelpButton',
    mixins:[DojoWidget],
    props: ['help'],
    data: function () {
        return {
            texts: [],
            selected: "default",
            selectedParagraph: "",
            search: "",
            hasSideBar: true,
            hasNotifications: true,
            contactName: '',
            contactEmail: '',
            contactMessage:'',
            contactError: '',
            concatSucess: ''
        }
    },
    components: {},
    computed: {
        loading () {
            return this.texts.length === 0
        },
        current () {
            let text = this.texts.find(t => t.id === this.selected)
            if (!text) {
                text = this.texts[0]
            }
            return text
        },
        topics () {
            let query = this.search.toLowerCase()
            if (query.length > 2) {
                return this.texts.filter(t => {
                    if (t._all.indexOf(query) >= 0) {
                        return true
                    }
                })
            }
           return this.texts
        }
    },
    methods: {
        setTopic (t) {
            this.selected = t
            this.selectedParagraph = ""
        },
        setSupTopic (paragraph) {
            this.selectedParagraph = paragraph
            Vue.nextTick( () => {
                this.focus(paragraph)
            })
        },
        focus (id) {
            if (this.$refs.paragraph) {
               let p = this.$refs.paragraph.find(p => {
                   return p.getAttribute('pid') === id;
               })
               if (p) {
                   p.scrollIntoView()
               }
           
            }
        },
        convertNotification (n) {
            let news = {
                "id": "notifications." + n.id,
                "title": n.title,
                "body": n.more
            } 
            if (n.video) {
                let url = n.video
                if (url.indexOf('src="') > 0 ){
                    url = url.substring(url.indexOf('src="') + 5)
                    url = url.substring(0, url.indexOf('"'))
                }
                news.video = {
                    "src": url
                }
            }
            return news
        },
        async sendContact () {
      
            if (this.contactEmail && this.contactMessage) {
                let res = await Services.getUserService().contact(this.contactName, this.contactEmail, this.contactMessage)
                if (res) {
                    this.$root.$emit('Success', 'Thanks for contacting us! The dialog will close automatically')
                    this.concatSucess = 'Thanks for contacting us! The dialog will close automatically'
                    this.contactError = ''

                    setTimeout(() => {
                        this.selected = 'default'
                    }, 2000)
                }
            } else {
                this.contactError = 'Please fill out the form'
                this.concatSucess = ''
            }   
        }
    }, 
    async mounted () {
        let texts = await Services.getHelpService().getAll()
        if (this.hasNotifications) {
            let notifications = await Services.getUserService().getNotications()
            if (notifications) {
                notifications.sort(function(a,b) {
					return b.lastUpdate - a.lastUpdate;
                });
                
                texts = [{
                    "id": "notifications",
                    "name":"News",
                    "title": "News",
                    "body": `
                    `,
                    "paragraphs": notifications.map(n => this.convertNotification(n))
                }].concat(texts)
                this.selected = 'notifications'
            }
        }
        this.texts = texts
        if (this.selectedParagraph) {
            Vue.nextTick( () => {
                this.focus(this.selectedParagraph)
            })
        }
    }
}
</script>