x
<template>
    <div class="MatcHelp">
       
            <span v-if="loading" class="MatchHint">
                Loading...
            </span>
            <div v-else class="MatcHelpContentCntr">
                <h2>{{current.title}}</h2>
                <p v-html="current.body" class="MatcHelpContentParagraph"></p>


                <div v-if="current.image" class="MatcHelpContenImage">
                    <img :src="current.image.src"/>
  
                </div>
                <caption v-if="current.image && current.image.caption">{{current.image.caption}}</caption>

                <div class="MatcHelpContentVideo" >
                    <iframe
                        v-if="current.video"
                        :width="560 * videoScaleFactor"
                        :height="315 * videoScaleFactor"
                        :src="current.video.src"
                        frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>
                </div>

                <div v-if="current.hasContact">
                   
                    <div class="form-group">
                        <label>Email</label>
                        <input class="form-control MatcIgnoreOnKeyPress" v-model="contactEmail"/>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea class="form-control MatcIgnoreOnKeyPress" v-model="contactMessage"/>
                    </div>

                    <div class="MatcButtonBar">
                        <div class="MatcButton MatcButtonPrimary" @click="sendContact">Send</div>
                        <span class="MatcError">
                            {{contactError}}
                        </span>
                        <span class="MatcSuccess">
                            {{concatSucess}}
                        </span>
                    </div>
                </div>

                <div v-for="p in current.paragraphs" :key="p.id" :pid="p.id" ref="paragraph" :class="'MatcHelpContentParagraph ' + p.css">
                    <h3 v-if="p.title">
                        {{p.title}}
                    </h3>
                    <p v-html="p.body"></p>

                    <div v-if="p.image" class="MatcHelpContenImage">
                        <img :src="p.image.src"/>
                
                    </div>
                    <caption v-if="p.image && p.image.caption">{{p.image.caption}}</caption>

                     <iframe
                        v-if="p.video"
                        :width="560 * videoScaleFactor"
                        :height="315 * videoScaleFactor"
                        :src="p.video.src"
                        frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>

                </div>

            </div>

            <div class="">
                <div class="MatcHelpTopics" v-if="hasSideBar">
                <div v-if="hasSearch">
                    <input type="search" class=" MatcCreateSearch MatcIgnoreOnKeyPress form-control" placeholder="Search" v-model="search"/>
                </div>
                <span v-if="loading" class="MatchHint">
                    Loading...
                </span>
                <div class="MatcHelpTopicsCntr">
                    <div v-if="!standalone">
                        <template v-for="topic in topics">
                            <a @click="setTopic(topic.id)" :class="[{'selected': topic.id === selected && !selectedParagraph}, topic.css]" :key="topic.id" :topicid="topic.id" ref="links" >
                                {{topic.name}}
                            </a>
                            <template v-if="topic.id === selected">
                                <template v-for="(p, i) in topic.paragraphs"  >
                                    <a  v-if="p.title" :key="i" :class="['MatcHelpSubTopic', {'selected': p.id === selectedParagraph}]" @click.stop="setSupTopic(p.id)" :topicid="p.id" ref="links"  >
                                        {{p.title}}
                                    </a>
                                </template>
                               
                            </template>
                        </template>
                    </div>
                    <div v-else>
                        <template v-for="topic in topics">
                            <a :class="[{'selected': topic.id === selected && !selectedParagraph}, topic.css]" :key="topic.id" :href="'#/help/' + topic.id + '.html'" :topicid="topic.id" ref="links" >
                                {{topic.name}}
                            </a>
                            <template v-if="topic.id === selected">
                                <template v-for="(p, i) in topic.paragraphs"  >
                                    <a  v-if="p.title" :key="i"  :class="['MatcHelpSubTopic', {'selected': p.id === selectedParagraph}]" :href="'#/help/' + topic.id + '/' + p.id +'.html'"  :topicid="p.id" ref="links" >
                                        {{p.title}}
                                    </a>
                                </template>
                            </template>
                        </template>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
<style scoped>
textarea {
    height: 200px;
}
</style>

<style lang="scss">
  @import "../style/components/help.scss" ;
</style>


<script>
import DojoWidget from 'dojo/DojoWidget'
import Services from 'services/Services'
import Vue from 'vue'

export default {
    name: 'HelpButton',
    mixins:[DojoWidget],
    props: ['help', 'standalone'],
    data: function () {
        return {
            texts: [],
            selected: "getting_started",
            selectedParagraph: "",
            search: "",
            hasSideBar: true,
            hasSearch: false,
            hasNotifications: true,
            contactName: '',
            contactEmail: '',
            contactMessage:'',
            contactError: '',
            concatSucess: '',
            videoScaleFactor: 1.2
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
                    if (t._all && t._all.indexOf(query) >= 0) {
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
        setSupTopic (paragraph, focusLink=false) {
            this.selectedParagraph = paragraph
            Vue.nextTick( () => {
                this.focus(paragraph, focusLink)
            })
        },
        focus (id, focusLink) {
            if (this.$refs.paragraph) {
               let p = this.$refs.paragraph.find(p => {
                   return p.getAttribute('pid') === id;
               })
               if (p) {
                   p.scrollIntoView()
               }
            }
            setTimeout(() => {
                if (focusLink) {
                    if (this.$refs.links) {
                        let a = this.$refs.links.find(p => {
                            return p.getAttribute('topicid') === id;
                        })
                        if (a) {
                            a.scrollIntoView()
                        }
                    }                  
                }
            }, 100)
           
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
        },
        setTopicByRoute () {
            if (this.$route.params.topic) {
                this.setTopic(this.$route.params.topic)
            }
            if (this.$route.params.subtopic) {
                this.setSupTopic(this.$route.params.subtopic)
            }
        }
    },
    watch: {
        $route () {
            this.setTopicByRoute()
        }
    },
    async mounted () {
        if (this.standalone) {
            this.hasNotifications = false
            this.videoScaleFactor = 0.9
        }

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
        if (this.standalone) {
            this.setTopicByRoute()
        }
    }
}
</script>