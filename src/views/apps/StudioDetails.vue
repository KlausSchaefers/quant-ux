<template>
    <div class="StudioDetails" id="">
        <template v-if="summary">
            <div class="StudioDetailsHeader">
                <h4>{{$t('app.test-summary')}}</h4>
                <a class="MatcActionLink MatcStudioAction " @click="showMore">
                    <span class="MatcSplitView200Hidden"> {{$t('app.view-more')}}</span>
                    >
                </a>
            </div>

            <div class="StudioDetailsKPICntr" >
                <div class="StudioDetailsKPI" :style="{'background': getBackgroundColor(summary.sessionCount, 5, 30)}">
                    <h4>{{ summary.sessionCount }}</h4>
                    <label>{{$t('app.kpi-sessions')}}</label>
                </div>

                <div class="StudioDetailsKPI">
                    <h4>{{ summary.sessionDurationMean}} {{summary.sessionDurationMeanLabel}}</h4>
                    <label v-html="$t('app.kpi-duration')"></label>
                </div>
                <div class="StudioDetailsKPI" :style="{'background': getBackgroundColor(summary.taskSuccessMean, 33, 66)}">
                    <h4>{{ summary.taskSuccessMean }} {{summary.taskSuccessMeanLabel}}</h4>
                    <label v-html="$t('app.kpi-task')"></label>
                </div>
                <div class="StudioDetailsKPI">
                    <h4>{{summary.expRate }} {{summary.expRateLabel}}</h4>
                    <label>{{$t('app.kpi-coverage')}}</label>
                </div>
            </div>

   

            <div class="StudioDetailsComments">
                <div class="StudioDetailsHeader">
                     <h4>{{$t('app.comments')}}</h4>
                    <a class="MatcActionLink MatcStudioAction " @click="addComment">
                        +
                        <span class="MatcSplitView200Hidden"> {{$t('app.add-comment')}}</span>
          
                    </a>
                </div>
                <div class="StudioDetailsCommentsList" ref="commentList">
                    <StudioComment v-if="hasNew"
                        :isNew="true"
                        :user="user" 
                        :comment="{}"
                        @cancel="hasNew = false"
                        @create="onCreateComment"
                        />
                    <StudioComment 
                        v-for="c in filteredCommentsTree" :key="c.id"
                        @delete="onDeleteComment"
                        @reply="onCreateComment"
                        @change="onChangeCommentMessage"
                        @status="onChangeCommentStatus"
                        :user="user" 
                        :comment="c"/>
                </div>
            </div>
        </template>
        <div v-else>
            <div class="MatcLoading">
                {{$t('common.loading')}}
            </div>
       
        </div>
    </div>
</template>

<script>

import Logger from "common/Logger";
import Util from "core/Util";
import PerformanceMonitor from 'core/PerformanceMonitor'
import DataFrame from "common/DataFrame";
import Analytics from "dash/Analytics";
import Services from "services/Services";
import StudioComment from './StudioComment'
import lang from 'dojo/_base/lang'

export default {
    name: "StudioDetails",
    mixins: [Util],
    props: ["app", "test", "user", "annotation", "events", "hash", "isLoaded"],
    data: function () {
        return {
            lastRenderSumamry: 0,
            hasCommentFilter: true,
            hasNew: false,
            summary: false,
            comments: []
        };
    },
    components: {
        'StudioComment': StudioComment
    },
    computed: {
        pub() {
            return this.$route.meta && this.$route.meta.isPublic === true;
        },
        filteredCommentsTree () {
            const tab = this.$route.params.tab
            const session = this.$route.params.session
            const parentLookup = lang.listGroupBy(this.comments, 'parentId')
            let comments = this.comments.map(c => {
                const result = lang.clone(c)
                if (parentLookup[c.id]) {
                    result.children = parentLookup[c.id]
                }
                return result
            })
       
            if (this.hasCommentFilter) {
                if (tab === 'test') {
                    comments = comments.filter(c => c.type === 'overview_test' && !c.reference)
                }
                if (tab === 'analyze') {
                    comments = comments.filter(c => c.type === 'overview_dash')
                }
                if ((!tab || tab === 'design') && !session) {
                    comments = comments.filter(c => c.type === 'ScreenComment' || c.type === 'overview_edit')
                }
                if (session) {
                    comments = comments.filter(c => c.type === 'overview_test' && c.reference === session)
                }
            }
            if (tab === 'comments') {
                return []
            }  
            return comments.toSorted((a,b) => {
                return b.created - a.created
            }).filter(c => !c.parentId)
        }
    },
    methods: {
        onChangeAppDescription () {
            const txt = this.$refs.inputDescription.innerText
            this.$emit("change", txt)
        },
        showMore () {
            this.emit("more")
        },
        addComment () {
            this.hasNew = true
        },
        async onCreateComment(m, parentId) {
            if (!m) {
                this.hasNew = false
                return
            }
            const comment = {
                message: m,
				reference: '',
				type: "overview_edit",
				user: {
					"_id" : this.user.id,
					"email" : this.user.email,
					"name" : this.user.name,
					"lastname" : this.user.lastname,
					"image" :  this.user.image,
					"id" : this.user.id
				},
				userID: this.user.id,
				created: new Date().getTime()
            }
          
            const tab = this.$route.params.tab
            const session = this.$route.params.session
            if (tab === 'test') {
                comment.type = 'overview_test'
            }
            if (tab === 'analyze') {
                comment.type = 'overview_dash'
            }
            if (tab === 'design') {
                comment.type = 'overview_edit'              
            }
            if (session) {
                comment.type = 'overview_test' 
                comment.reference = session
            }

            if (parentId) {
                comment.parentId = parentId
                const parent = this.comments.find(c => c.id === parentId)
                if (parent) {
                    comment.type = parent.type
                    comment.reference = parent.reference
                }
            }

    
            let response = await Services.getCommentService().create(this.app.id, comment)
            if (response.id) {
                comment.id = response.id
                this.showSuccess("Comment created");
                this.comments.unshift(comment)
            } else {
                this.showError("Soemthing went wrong");
            }  
            this.hasNew = false
        },
        async onChangeCommentStatus(id, status) {
            const found = this.comments.find(c => c.id === id)
            if (found) {
                found.status = status
                found.modified = new Date().getTime()
                found.edited = true
				await Services.getCommentService().update(this.app.id, found)
                this.showSuccess("Status updated");
            } else {
                console.error('Cannot find comment', id)
            }
        },
        async onChangeCommentMessage (id, message) {
            const found = this.comments.find(c => c.id === id)
            if (found) {
                found.message = message
                found.modified = new Date().getTime()
                found.edited = true
				await Services.getCommentService().update(this.app.id, found)
                this.showSuccess("Comment updated");
            } else {
                console.error('Cannot find comment', id)
            }
        },
        async onDeleteComment(comment) {
            this.comments = this.comments.filter(c => c.id !== comment.id)        
            if (!this.pub) {
                await Services.getCommentService().delete(this.app.id, comment)
                this.showSuccess("Comment deleted");
            }
            const children = this.comments.filter(c => c.parentId == comment.id)
            this.logger.log(1, "onDeleteComment", "Children " + children.length);
            children.forEach(child => {
                Services.getCommentService().delete(this.app.id, child)
                this.comments = this.comments.filter(c => c.id !== child.id)    
            })
        },
        getBackgroundColor (v, low, high) {    
            if (isNaN(v)) {
                return ''
            }
            if (v <= low) {
                return '#FFECF2'
            }
            if (v >= high) {
                return '#D4F7D3'
            }
            return //' '#F7EFD3'
        },
        onChange () {
            // This method gets called three times, if any of the props change,
            // but we do not want to render 3 times...
            setTimeout(async () => {
                const now = new Date().getTime()
                if (now - this.lastRenderSumamry > 500) {
                    await this.loadComments()
                    this.setSummary()
                }
            }, 200)
        },
        async loadComments () {
            this.comments = await Services.getCommentService().findAll(
                this.app.id
            );
            this.logger.log(1, "loadComments", "exit", this.comments.length);
        },
        setSummary() {
            this.logger.log(1, "setSummary", "enter");
            if (!this.app || !this.isLoaded) {
                return
            }
            this.lastRenderSumamry = new Date().getTime()
            PerformanceMonitor.start('StudioDetails.setSummary()')
            const events = this.filterEvents(this.events, this.annotation);
            const df = this.getActionEvents(new DataFrame(events));
            df.sortBy("time");
            this._addTestKPI(df, this.app);

            PerformanceMonitor.end('StudioDetails.setSummary()')
        },

        _addTestKPI(df, app) {
            PerformanceMonitor.start('AnalyticsTab._addTestKPI()')
            const sessionGroup = df.groupBy("session");
            const count = df.count("session");
            const min = sessionGroup.min("time");
            const max = sessionGroup.max("time");
            max.minus(min);

            const summary = {};
            summary.sessionCount = count.size();
            if (count.size() === 0) {
                summary.sessionDurationMean = '-'
                summary.expRate = '-'
            } else {
                summary.sessionCountMean = Math.round(count.mean());               
                summary.sessionDurationMean = Math.round(max.mean() / 1000);             
                if (isNaN(summary.sessionDurationMean)) {
                    summary.sessionDurationMean = 0;
                }
                summary.sessionDurationMeanLabel = 's'

                const screenCount = this.getObjectLength(app.screens);
                const uniqueScreenPerSession = sessionGroup.unique("screen");
                let expRate = uniqueScreenPerSession.mean() / screenCount;
                if (isNaN(expRate)) {
                    expRate = 0;
                }
                if (isNaN(expRate)) {
                    expRate = 0;
                }
                summary.expRate = Math.round(expRate * 100)
                summary.expRateLabel ='%';
            }


            const tasks = this.test.tasks;
            if (tasks && tasks.length > 0) {
                const analytics = new Analytics();
                const taskSummaries = analytics.getTaskSummary(df, tasks, this.annotation);
                let sumSuccess = 0
                taskSummaries.forEach(s => {
                    sumSuccess += s.success
                })

                summary.taskSuccessMean = Math.round(100* (sumSuccess / taskSummaries.length))
                summary.taskSuccessMeanLabel = '%'
            } else {
                summary.taskSuccessMean = '-'
            }

            this.summary = summary;
            PerformanceMonitor.end('AnalyticsTab._addTestKPI()')
        }
    },
    watch: {
        isLoaded (v) {
            this.isLoaded = v;
            if (!v) {
                this.comments = []
                this.hasNew = false
                this.summary = false
            }
        },
        app(v) {
            this.logger.info("watch", "app >", v);
            this.app = v;
            this.onChange()
        },
        test(v) {
            this.logger.info("watch", "test >", v);
            this.test = v;
            this.onChange()
        },
        events(v) {
            this.logger.log(1, "watch", "events >", v);
            this.events = v;
            this.onChange()
        }
    },
    async mounted() {
        this.logger = new Logger("StudioDetails");
        this.setSummary()
    }
};
</script>
  