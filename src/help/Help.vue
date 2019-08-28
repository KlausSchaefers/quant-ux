
<template>
    <div class="MatcHelp">
        <div class="MatcHelpContent">
            <span v-if="loading" class="MatchHint">
                Loading...
            </span>
            <div v-else class="MatcHelpContentCntr">
            
                <h2>{{current.title}}</h2>
                <p v-html="current.body"></p>
                
                
                <iframe
                    v-if="current.video" 
                    :width="560 * 1.2" 
                    :height="315 * 1.2" 
                    :src="current.video.src" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                </iframe>

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
            <div>
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
            hasSideBar: true
        }
    },
    components: {},
    computed: {
        loading () {
            return this.texts.length === 0
        },
        current () {
            return this.texts.find(t => t.id === this.selected)
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
        }
    }, 
    async mounted () {
        let service = Services.getHelpService()
        this.texts = await service.getAll()
        if (this.selectedParagraph) {
            Vue.nextTick( () => {
                this.focus(this.selectedParagraph)
            })
        }
    }
}
</script>