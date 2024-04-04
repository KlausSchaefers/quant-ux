
<template>
    <div class="MatcToolbar MatcAnalyticsToolbar MatcLayerListVisible">
    </div>
</template>
<script>

import css from 'dojo/css'
import lang from 'dojo/_base/lang'

import on from 'dojo/on'
import touch from 'dojo/touch'
import hash from 'dojo/hash'

import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import Dialog from 'common/Dialog'
import CheckBox from 'common/CheckBox'
import RadioBoxList from 'common/RadioBoxList'
import Form from 'common/Form'
import ToolbarDropDownButton from 'canvas/toolbar/components/ToolbarDropDownButton'
import ToolbarColor from 'canvas/toolbar/components/ToolbarColor'
import Ring from 'common/Ring'
import Analytics from 'dash/Analytics'
import VideoPlayer from 'views/apps/test/VideoPlayer'
import DataFrame from 'common/DataFrame'
import SessionList from './SessionList'

export default {
    name: 'AnalyticToolbarRender',
    mixins: [],
    data: function () {
        return {
            hasSelectAll: false,
            hasSessionDetails: true
        }
    },
    components: {
    },
    methods: {


        renderToolbar() {
            this.logger.log(3, "renderToolbar", "enter");
            if (this.isRendered) {
                return
            }
            this.isRendered = true
            this.logger.log(3, "renderToolbar", "exit");
        },

        render() {
            this.logger.log(3, "render", "entry");

            this.properties = document.createElement("div");
            css.add(this.properties, "MatcToobarPropertiesSectionCntr")

            this.sections = [];

            this.propertiesStates = {};

            this.renderScreenProperties();

            this.renderScreenModes();

            this.renderWidgetProperties();

            this.renderSessionProperties();

            this.renderSessionSection();

            this.renderDropOffProperties()

            this.renderHeatMapProperties();

            this.renderGestureProperties();

            this.propertiesCntr.appendChild(this.properties);


            /**
             * Now assemble final ui. hook in properties panel and make toolSection Visible!
             */
            this.scroller = this.$new(ScrollContainer);
            this.scroller.placeAt(this.propertiesCntr);
            this.scroller.wrap(this.properties, 40);

            this.hideAllSections();

            this.showHeatMapProperties();
            this.showClickHeatMap()

            this.logger.log(3, "render", "exit");
        },




        renderScreenProperties() {
            this.logger.log(3, "renderScreenProperties", "entry");


            var db = new DomBuilder();
            /**
             * Name
             */
            this.screenNameDiv = this.createSection("Screen", this.properties);
            var content = this.createContent(this.screenNameDiv);

            this.screenName = this.createInput(content, "Screen Name");
            this.screenName.readOnly = true;

            var ringCntr = db.div("MatcCenter").build(content);

            /**
             * Views total
             */
            var cntr = db.div("MatcMarginBottom").build(ringCntr)
            this.screenTestRing = this.createRing("Test Coverage", "analytics.canvas.kpi.coverage");
            this.screenTestRing.placeAt(cntr);

            /**
             * Dwell
             */
            cntr = db.div("MatcMarginBottom").build(ringCntr)
            this.screenDwellRing = this.createRing("Dwell Time", "analytics.canvas.kpi.dwell");
            this.screenDwellRing.placeAt(cntr);

            /**
             * Views total
             */
            cntr = db.div("MatcMarginBottom").build(ringCntr)
            this.screenTotalViewRing = this.createRing("Screen Views", "analytics.canvas.kpi.screen-views");
            this.screenTotalViewRing.placeAt(cntr);


            /**
             * CLicks
             */
            cntr = db.div("MatcMarginBottom").build(ringCntr)
            this.screenClickRing = this.createRing("Screen Clicks", "analytics.canvas.kpi.screen-clicks");
            this.screenClickRing.placeAt(cntr);


            /**
             * CLicks
             */
            cntr = db.div("MatcMarginBottom").build(ringCntr)
            this.screenWidgetClickRing = this.createRing("Widget Clicks", "analytics.canvas.kpi.screen-widget-clicks");
            this.screenWidgetClickRing.placeAt(cntr);

        },


        renderWidgetProperties() {
            this.logger.log(3, "renderWidgetProperties", "entry");

            var db = new DomBuilder();

            /**
             * Name
             */
            this.widgetNameDiv = this.createSection("Widget ", this.properties);
            var content = this.createContent(this.widgetNameDiv);
            this.widgetName = this.createInput(content, "Screen");
            this.widgetName.readOnly = true;
            var ringCntr = db.div("MatcCenter").build(content);

            /**
             * CLicks
             */
            let cntr = db.div("MatcMarginBottom").build(ringCntr)
            this.widgetClickRing = this.createRing("Widget Clicks", "analytics.canvas.kpi.clicks");
            this.widgetClickRing.placeAt(cntr);


            /**
             * First Clicks
             */
            cntr = db.div("MatcMarginBottom").build(ringCntr)
            this.widgetFirstClickRing = this.createRing("First Clicks", "analytics.canvas.kpi.first-clicks");
            this.widgetFirstClickRing.placeAt(cntr);

            /**
             * Discovery
             */
            cntr = db.div("MatcMarginBottom").build(ringCntr);
            var nodes = this.createBigNumber(db, cntr, "Time before Click", "analytics.canvas.kpi.before-click");
            this.widgetDiscoverLabel = nodes[0];
            this.widgetDiscoverSTDLabel = nodes[1];

        },


        renderHeatMapProperties() {
            this.logger.log(1, "renderHeatMapProperties", "entry");

            var db = new DomBuilder();

            this.heatmapDiv = this.createSection("Show", this.properties);

            let content = this.createContent(this.heatmapDiv);

            var row = db.div("MatcToobarRow MatcMarginBottom").build(content);

            var list = this.$new(RadioBoxList);
            css.add(list.domNode, "MatcToolbarRadioList");
            list.setOptions([
                { "value": -1, label: "All Clicks" },
                { "value": 1, label: "First Click" },
                { "value": 3, label: "First three Clicks" },
                { "value": "missedClicks", label: "Missed Clicks" },
                { "value": "mouse", label: "Mouse" }
            ]);
            list.placeAt(db.div().build(row));
            this.own(list.on("change", lang.hitch(this, "showFirstClickHeatMap")));


            this.heatmapLabel = db.div('MatcToobarRow').label('MatcToolbarLabel MatcToolbarHelpSection').build(content)

            this.heatmapClickList = list;
            this.setHeatMapLabel(-1)
        },

        setHeatMapLabel(i) {
            let lbl = ''
            if (i === -1) {
                lbl = this.getNLS('analytics.canvas.heatamp.hintAll')
            }
            if (i === 1) {
                lbl = this.getNLS('analytics.canvas.heatamp.hintFirst')
            }
            if (i === 3) {
                lbl = this.getNLS('analytics.canvas.heatamp.hintFirstThree')
            }
            if (i === 'missedClicks') {
                lbl = this.getNLS('analytics.canvas.heatamp.hintMissed')
            }

            if (i === 'mouse') {
                lbl = this.getNLS('analytics.canvas.heatamp.hintMouse')
            }
            this.heatmapLabel.textContent = lbl
        },

        renderDropOffProperties() {
            this.logger.log(2, "renderSessionProperties", "entry");

            var db = new DomBuilder();


            this.dropOffConfigDiv = this.createSection("Show", this.properties);
            var content = this.createContent(this.dropOffConfigDiv);
            var row = db.div("MatcToobarRow MatcToolbarRadioList").build(content);

            this.dropOffTimeCheckBox = this.$new(RadioBoxList, { maxLabelLength: 20 });
            this.dropOffTimeCheckBox.setOptions([
                { value: false, label: 'Drop Off' },
                { value: true, label: 'Time' }
            ]);
            this.dropOffTimeCheckBox.setValue(false);
            this.dropOffTimeCheckBox.placeAt(row);
            this.own(on(this.dropOffTimeCheckBox, "change", lang.hitch(this, "selectDropOffTask")));


            this.dropOffOptionsDiv = this.createSection("Tasks", this.properties);
            content = this.createContent(this.dropOffOptionsDiv);
            row = db.div("MatcToobarRow ").build(content);


            this.dropOffTaskBtn = this.$new(RadioBoxList, { maxLabelLength: 20 });

            let tasks = []

            if (this.testSettings.tasks && this.testSettings.tasks.length >= 1) {
                tasks = this.testSettings.tasks.map((task, i) => {
                    return { value: i, label: task.name }
                })
            } else {
                this.dropOffOptionsLabel = db.span(
                    "MatcToolbarLabel MatcToolbarHelpSection",
                    this.getNLS("analytics.canvas.dropoff.hintNoTasksDefined")
                ).build(row)
            }

            this.dropOffTaskBtn.setOptions(tasks);
            this.dropOffTaskBtn.setValue(0);
            css.add(this.dropOffTaskBtn.domNode, "MatcToolbarRadioList");
            this.dropOffTaskBtn.placeAt(row);
            this.own(on(this.dropOffTaskBtn, "change", lang.hitch(this, "selectDropOffTask")));

            this.dropOffChartDivCntr = this.createSection("Insights", this.properties);
            content = this.createContent(this.dropOffChartDivCntr);

            var ringCntr = db.div("MatcCenter ").build(content);
            this.dropoffTaskSuccess = this.createRing("Success", "analytics.canvas.kpi.first-clicks");
            css.add(this.dropoffTaskSuccess.domNode, 'MatcMarginBottom')
            this.dropoffTaskSuccess.placeAt(ringCntr);


            let cntr = db.div("MatcMarginBottom").build(ringCntr);
            var nodes = this.createBigNumber(db, cntr, "Duration", "analytics.canvas.kpi.before-click");
            this.dropOffTaskDuration = nodes[0];
            this.dropOffTaskDurationLabel = nodes[1];


            cntr = db.div("MatcMarginBottom").build(ringCntr);
            nodes = this.createBigNumber(db, cntr, "Interactions", "analytics.canvas.kpi.before-click");
            this.dropOffInteractions = nodes[0];
            this.dropOffInteractionsLabel = nodes[1];


            this.dropOffFunnelDivCntr = this.createSection("Drop Off", this.properties);
            content = this.createContent(this.dropOffFunnelDivCntr);

            this.dropOffChartDiv = db.div('MatcToolbarDropOffChart', '').build(content)
        },


        renderSessionProperties() {
            this.logger.log(1, "renderSessionProperties", "entry");

            const db = new DomBuilder();

            this.sessionOptionsDiv = this.createSection("Show", this.properties);
            let content = this.createContent(this.sessionOptionsDiv);

            let row = db.div("MatcToobarRow MatcToolbarRadioList").build(content);

            this.sessionTreeCheckBox = this.$new(RadioBoxList)
            this.sessionTreeCheckBox.setOptions([
                { value: true, label: "Merged Graph" },
                { value: false, label: "Individual Tests" },
            ])

            // this.sessionTreeCheckBox = this.$new(CheckBox);
            // this.sessionTreeCheckBox.setLabel("Merge Graph");
            //css.add(this.sessionTreeCheckBox.domNode, "MatcToolbarItem");
            this.sessionTreeCheckBox.setValue(true);
            this.sessionTreeCheckBox.placeAt(row);
            this.own(on(this.sessionTreeCheckBox, "change", lang.hitch(this, "showUserJourney")));


            row = db.div("MatcToobarRow").build(content);
            this.sessionOutlierCheckbox = this.$new(CheckBox);
            css.add(this.sessionOutlierCheckbox.domNode, "MatcToolbarItem");
            this.sessionOutlierCheckbox.setValue(false);
            this.sessionOutlierCheckbox.setLabel("Show Outlier");
            this.sessionOutlierCheckbox.placeAt(row);
            this.own(on(this.sessionOutlierCheckbox, "change", lang.hitch(this, "showUserJourneyOutlier")));


            this.sessionOutlierDiv = this.createSection("Colors", this.properties);
            content = this.createContent(this.sessionOutlierDiv);
            row = db.div("MatcToobarRow ").build(content);


            this.sessionLineColor = this.$new(ToolbarColor, { updateColor: true, hasCustomColor: false, hasPicker: false });
            this.sessionLineColor.placeAt(row);
            this.sessionLineColor.setLabel('Graph');
            this.sessionLineColor.setModel(this.model);
            this.sessionLineColor.setValue("#33b5e5");
            css.add(this.sessionLineColor.domNode, " hidden");
            this.own(on(this.sessionLineColor, "change", lang.hitch(this, "showUserJourney")));

            this.sessionTaskLineColor = this.$new(ToolbarColor, { updateColor: true, hasCustomColor: false, hasPicker: false });
            this.sessionTaskLineColor.placeAt(row);
            this.sessionTaskLineColor.setLabel('Task');
            this.sessionTaskLineColor.setModel(this.model);
            this.sessionTaskLineColor.setValue("#92c500");
            css.add(this.sessionTaskLineColor.domNode, "");
            this.own(on(this.sessionTaskLineColor, "change", lang.hitch(this, "showUserJourney")));


            this.sessionOutlierColor = this.$new(ToolbarColor, { updateColor: true, hasCustomColor: false, hasPicker: false });
            this.sessionOutlierColor.placeAt(row);
            this.sessionOutlierColor.setLabel('Outlier');
            this.sessionOutlierColor.setModel(this.model);
            this.sessionOutlierColor.setValue("#ffb61c");
            css.add(this.sessionOutlierColor.domNode, "");
            this.own(on(this.sessionOutlierColor, "change", lang.hitch(this, "showUserJourney")));


            this.sessionShowDiv = this.createSection("Options", this.properties);
            content = this.createContent(this.sessionShowDiv);
            row = db.div("MatcToobarRow MatcToolbarRadioList").build(content);
            this.sessionTimeCheckBox = this.$new(RadioBoxList, { maxLabelLength: 20 });
            this.sessionTimeCheckBox.setOptions([
                { value: false, label: 'Navigation' },
                { value: true, label: 'Time' }
            ]);

            this.sessionTimeCheckBox.setValue(false);
            this.sessionTimeCheckBox.placeAt(row);
            this.own(on(this.sessionTimeCheckBox, "change", lang.hitch(this, "showUserJourney")));


            this.sessionTaskCntr = this.createSection("Tasks", this.properties);
            content = this.createContent(this.sessionTaskCntr);

            row = db.div("MatcToobarRow ").build(content);

            var tasks = [{ value: -1, label: "No Task" }];
            if (this.testSettings.tasks) {
                for (let i = 0; i < this.testSettings.tasks.length; i++) {
                    let task = this.testSettings.tasks[i];
                    tasks.push({ value: i, label: task.name });
                }
            }
            this.sessionTaskBtn = this.$new(RadioBoxList, { maxLabelLength: 20 });
            this.sessionTaskBtn.setOptions(tasks);
            this.sessionTaskBtn.setValue(-1);
            css.add(this.sessionTaskBtn.domNode, "MatcToolbarRadioList");
            this.sessionTaskBtn.placeAt(row);
            this.own(on(this.sessionTaskBtn, "change", lang.hitch(this, "selectUserJournyTask")));


        },

        renderSessionSection() {


            this.sessionDiv = this.db.div("MatcToolbarSection").build(this.testListCntr)
            let content = this.createContent(this.sessionDiv);
            css.add(content, "MatcMarginBottomXXL");


            let row = this.db.div("MatcToobarRow").build(content);

            this.sessionOrderBrn = this.$new(ToolbarDropDownButton, { maxLabelLength: 20 });
            this.sessionOrderBrn.setOptions([
                { value: 'date', label: "Sort by Date" , icon:"Calendar"},
                { value: 'duration', label: "Sort by Duration" , icon:"Duration"},
                { value: 'events', label: "Sort by Events" , icon:"Hash"},   
                { value: 'weirdness', label: "Sort by Outlier", icon:"Outlier" },
                { value: '', css:'MatcToolbarPopUpLine', label: "" },
                { value: '', label: "Select all", callback: ()=> this.selectAllSessions(true), icon:"CheckBoxOn"},
                { value: '', label: "Unselect all", callback: ()=> this.selectAllSessions(false), icon:"CheckBoxOff"}
            ]);
            this.sessionOrderBrn.setPopupCss("MatcActionAnimProperties MatcPopupArrowLeft");
    
            this.sessionOrderBrn.updateLabel = false;
            this.sessionOrderBrn.hasFixedLabel = true
            this.sessionOrderBrn.reposition = true;
            this.sessionOrderBrn.repositionPosition = 'right';
            this.sessionOrderBrn.setValue('date')
            this.sessionOrderBrn.setLabel("Test Sessions")
            this.sessionOrderBrn.placeAt(row);
            this.tempOwn(on(this.sessionOrderBrn, "change", (v) => { 
                this.sessionListWidget.setOrder(v)
             }));
            this.sessionList = this._getTestList(this.events, this.annotation, this.testSettings);

            this.sessionListWidget = this.$new(SessionList)
            this.sessionListWidget.placeAt(content)
                  
            this.sessionListWidget.setSessions(this.sessionList)
            this.sessionListWidget.on('select', () => {
                this.onSessionSelectionChanged()
            })    
            this.sessionListWidget.on('hover', (s) => {
                this.hoverSession(s)
            })
            this.sessionListWidget.on('play', (s, e) => {
                this.showSession(s,e)
            })
            this.sessionListWidget.on('label', (s, label) => {
                this.onChangeSessionLabel(s,label)
            })
            
        },

        hoverSession(session) {
            if (this.analyticMode !== 'UserJourney') {
                return
            }
            if (this.canvas) {
                this.canvas.highlightSession(session?.session)
            }
        },

        showUserJourneyOutlier(showOutlier) {
            if (showOutlier) {
                let outliers = this.canvas.getOutlierScores();
                for (let session in this.sessionCheckBoxes) {
                    let chkBx = this.sessionCheckBoxes[session];
                    if (outliers[session]) {
                        css.remove(chkBx.domNode, "MatcToolbarItemStrikeThrough");
                    } else {
                        css.add(chkBx.domNode, "MatcToolbarItemStrikeThrough");
                    }
                }

            } else {
                for (let session in this.sessionCheckBoxes) {
                    let chkBx = this.sessionCheckBoxes[session];
                    css.remove(chkBx.domNode, "MatcToolbarItemPassive");
                    css.remove(chkBx.domNode, "MatcToolbarItemStrikeThrough");
                }
            }
            this.showUserJourney();
        },
        /**
         * Update the UI according the selected task. Show task color selector
         * and also fade out not matching sessions
         */
        selectUserJournyTask(taskNumber) {

            if (taskNumber >= 0) {
                // css.remove(this.sessionTaskLineColor.domNode, "hidden");
                // css.remove(this.sessionLineColor.domNode, "hidden")
                let task = this.testSettings.tasks[taskNumber];
                let taskPerformance = this.canvas.getTaskPerformance();
                for (let session in this.sessionCheckBoxes) {
                    let chkBx = this.sessionCheckBoxes[session];
                    if (taskPerformance[session] && taskPerformance[session][task.id]) {
                        css.remove(chkBx.domNode, "MatcToolbarItemStrikeThrough");
                        //chkBx.setValue(true);
                    } else {
                        //chkBx.setValue(false);
                        css.add(chkBx.domNode, "MatcToolbarItemStrikeThrough");
                    }
                }
            } else {
                // css.add(this.sessionTaskLineColor.domNode, "hidden");
                // css.add(this.sessionLineColor.domNode, "hidden")
                for (let session in this.sessionCheckBoxes) {
                    let chkBx = this.sessionCheckBoxes[session];
                    css.remove(chkBx.domNode, "MatcToolbarItemPassive");
                    css.remove(chkBx.domNode, "MatcToolbarItemStrikeThrough");
                }
            }
            this.showUserJourney();
        },

        setSelectSessions(ids) {
            if (this.sessionCheckBoxes) {
                for (var id in this.sessionCheckBoxes) {
                    if (ids.indexOf(id) >= 0) {
                        this.sessionCheckBoxes[id].setValue(true);
                    } else {
                        this.sessionCheckBoxes[id].setValue(false);
                    }
                }
                if (this.sessionAllCheckBox) {
                    this.sessionAllCheckBox.setValue(false);
                }

                this.onSessionSelectionChanged();
            }
        },

        selectAllSessions(value) {
            this.sessionListWidget.setAllSelected(value)
            this.onSessionSelectionChanged();
        },

        selectSession() {
            this.onSessionSelectionChanged();
        },

        onSessionSelectionChanged() {
            this.logger.log(-1, "onSessionSelectionChanged", "enter")
            this.reRenderAnalyticMode()
        },

        getSelectedSessions () {
            return this.sessionListWidget.getSelected()
        },

        onChangeSessionLabel (sessionID, label) {
            const start = this.events.find(e => e.type === 'SessionStart' && e.session === sessionID)
            if (start && start.label !== label) {
                start.label = label
                this.modelService.updateEvent(this.model.id,start)
            }
        },

        _getTestList(events, annotatation, testSettings) {

            const list = [];
            if (!testSettings.tasks) {
                testSettings.tasks = [];
                console.warn("_getTestList() > Added missing task array")
            }

            const df = new DataFrame(events);
            df.sortBy("time");
            const sessionGroup = df.groupBy("session");
            const sessions = sessionGroup.data;

            const annoSession = new DataFrame(annotatation).groupBy("reference");
            const analytics = new Analytics();
            const taskCount = testSettings.tasks.length;
            const tasksPerformance = analytics.getMergedTaskPerformance(df, testSettings.tasks, annotatation);
            const tasksBySession = tasksPerformance.count("session");

            const outliers = this.canvas.getOutlierScores()

            let id = 1;
            for (let sessionID in sessions) {
                let label = `Test ${id}`
                let session = sessions[sessionID];
                let date = this.formatDate(session.min("time"), true);

                let anno = annoSession.get(sessionID);
                let status = '<span class="MatchDashStatusSuccess">Valid</span>';
                let isValid = true;
                if (anno) {
                    isValid = anno.get(0).get("isValid");
                    if (!isValid) {
                        status = '<span class="MatchDashStatusFailure">Failure</span>';
                    }
                }

                let taskSuccess = tasksBySession.get(sessionID);
                if (!taskSuccess) {
                    taskSuccess = 0;
                }

                const start = session.data.find(e => e.type === 'SessionStart')
                if (start && start.label) {
                    label = start.label
                }

                const df = new DataFrame(session.data)
                const clicks = df.select("type", "in", ["ScreenClick", "WidgetClick", "WidgetChange", "ScreenGesture", "WidgetGesture"])

                const item = {
                    session: sessionID,
                    taskPerformance: taskSuccess + " / " + taskCount,
                    weirdness: outliers[sessionID],
                    duration: (Math.ceil((session.max("time") - session.min("time")) / 1000)),
                    date: date,
                    start: session.min("time"),
                    size: clicks.size(),
                    status: status,
                    isValid: isValid,
                    id: id,
                    label: label,
                    screens: session.unique("screen")
                };

                list.push(item);
                id++;
            }

            list.sort((a, b) => {
                return a.id - b.id;
            });

            return list;
        },

        renderGestureProperties() {
            const db = new DomBuilder();
            this.gestureOptionsDiv = this.createSection("Options", this.properties);
            const content = this.createContent(this.gestureOptionsDiv);
            const row = db.div("MatcToobarRow MatcMarginBottomXXL").build(content);
            db.span("MatcToolbarItemLabel", "Gesture Color").build(row);
            this.gestureLineColor = this.$new(ToolbarColor, { updateColor: true, hasCustomColor: false, hasPicker: false });
            this.gestureLineColor.placeAt(row);
            this.gestureLineColor.setLabel('Line Color');
            this.gestureLineColor.setModel(this.model);
            this.gestureLineColor.setValue("#0099cc");
            this.own(on(this.gestureLineColor, "change", lang.hitch(this, "showGestureMap")));
        },


        /*****************************************************************************************************
         * Screen Mode
         ****************************************************************************************************/


        renderScreenModes() {
            this.logger.log(3, "renderScreenModes", "entry");

            this.screenModeDiv = this.createSection("Show", this.properties);

            const content = this.createContent(this.screenModeDiv);

            const row = this.db.div("MatcToobarRow MatcMarginBottom").build(content);

            const list = this.$new(RadioBoxList);
            css.add(list.domNode, "MatcToolbarRadioList");
            list.setOptions([
                { label: 'Dwell Time', value: "HeatmapDwelTime", icon: "mdi mdi-timelapse" },
                { label: 'Scroll', value: "HeatmapScrollView", icon: "mdi mdi-swap-vertical" },
                { label: 'Scroll Time', value: "HeatmapScrollTime", icon: "mdi mdi-timer" },
                //{ label: 'Discovery Time', value: "HeatmapDiscoryTime", icon: "mdi mdi-timer" }
            ]);
            list.setValue("HeatmapDwelTime")

            this.screenModeRadioList = list
            list.placeAt(row);
            this.own(list.on("change", lang.hitch(this, "showScreenMode")));
        },

        /*****************************************************************************************************
         * show properties section and make sure the scroll bar is moved too!
         ****************************************************************************************************/

        showProperties() {
            css.remove(this.propertiesCntr, "MatcToolbarSectionHidden");
            if (this.canvas) {
                css.add(this.canvas.scrollRight, "MatcCanvasScrollBarRightOpen");
            }
        },

        hideProperties() {
            if (this.analyticMode == "UserJourney") {
                this.hideAllSections();
                this.showSessionProperties();
                return
            }

            if (this.analyticMode == "HeatmapClick") {
                this.hideAllSections();
                this.showHeatMapProperties();
                return
            }
            this.hideAllSections();
        },


        hideAllSections() {
            this.logger.log(3, "hideAllSections", "entry");
            for (var i = 0; i < this.sections.length; i++) {
                var section = this.sections[i];
                css.add(section, "MatcToolbarSectionHidden");
            }
        },


        /**********************************************************************
         * Canvas Delegates
         **********************************************************************/



        /**********************************************************************
         * DI stuff
         **********************************************************************/


        setController(c) {
            this.logger.log(3, "setController", "entry");
            this.controller = c;
        },

        setCanvas(c) {
            this.logger.log(3, "setCanvas", "entry");
            this.canvas = c;

        },

        setModelFactory(f) {
            this.logger.log(3, "setModelFactory", "entry");
            this.factory = f;
        },

        setModel(m) {
            this.model = this.createInheritedModel(m);
            this.modelName = m.name
            this.renderToolbar();
            this.render();
        },

        setAnnotation(a) {
            this.logger.log(-1, "setAnnotation", "enter > # ");
            this.annotation = a;
        },

        setTest(t) {
            this.logger.log(2, "setTest", "enter > # ");
            this.testSettings = t;
        },

        setEvents(events) {
            this.logger.log(2, "setEvents", "enter > # " + events.length);
            this.events = events;
        },

        setMode(mode) {
            this.logger.log(2, "setMode", "entry > '" + mode + "'");
            this.mode = mode;
            this.onModeChange();
        },


        onModeChange() {

        },


        /********************************************************
         * Helper
         ********************************************************/

        setSelectedViewButton() {
        },

        createRing(lbl, help, distCallBack) {

            var bgColor = "#cecece";
            var settings = this.canvas.getSettings();
            if (settings.canvasTheme == "MatcDark") {
                bgColor = "#777";
            }
            var ring = this.$new(Ring, { size: 100, width: 5, backgroundColor: bgColor, color: "#365fff", color2: "#83b600", color3: "#ffa713" });
            ring.setDomSize(120, 120);
            ring.setLabel(lbl);

            if (distCallBack) {
                ring.setAction("mdi mdi-chart-bar");
                this.tempOwn(ring.on("action", lang.hitch(this, distCallBack)));
            }

            if (help) {
                ring.setHelp(true);
                this.tempOwn(ring.on("help", lang.hitch(this, "showHelpDialog", help)));
            }

            css.add(ring.domNode, "MatcMarginTop");
            return ring;
        },

        createToolBarItem(label, callback, icon, parent) {
            var a = document.createElement("div");
            css.add(a, "MatcToolbarItem MatcToolbarPrimaryItem");

            if (icon) {
                var i = document.createElement("span");
                css.add(i, icon);
                a.appendChild(i);
            }

            // var lbl = document.createElement("label");
            // css.add(lbl, "MatcToolbarLabel");
            // lbl.innerHTML =label;
            // a.appendChild(lbl);


            if (callback) {
                this.tempOwn(on(a, touch.press, lang.hitch(this, callback)));
            }
            if (!parent) {
                this.properties.appendChild(a);
            } else {
                parent.appendChild(a);
            }

            return a;
        },


        createInput(content, placeholder) {

            var div = document.createElement("div");
            css.add(div, "MatcToolbarItem");
            content.appendChild(div);

            let input = document.createElement("input");
            input.disabled = true;
            css.add(input, "MatcIgnoreOnKeyPress MatcToobarInput  MatcToobarInlineEditDisabled");
            div.appendChild(input);

            if (placeholder) {
                input.placeholder = placeholder;
            }
            return input;
        },

        createContent(parent) {
            var content = document.createElement("div");
            css.add(content, "MatcToolbarSectionContent");
            parent.appendChild(content);
            return content;
        },

        createSection(lbl, parentNode, canBeHidden = true) {

            const parent = document.createElement("div");
            css.add(parent, "MatcToolbarSection");

            const header = this.createSectionHeader(parent, lbl);

            /**
             * store the value somehow in a cookie? and use it during restore??
             */
            this.own(on(header, touch.press, () => {
                css.toggle(parent, "MatcToolbarSectionCollabsed");
                return false;
            }));

            if (canBeHidden) {
                this.sections.push(parent);
            }
            parentNode.appendChild(parent);
            return parent;
        },

        createSectionHeader(parent, lbl, hasTemplateMarker) {
            var div = document.createElement("div");
            css.add(div, "MatcToolbarSectionLabel");
            parent.appendChild(div);

            div.innerHTML = lbl;

            if (hasTemplateMarker) {
                var span = document.createElement("span");
                css.add(span, "MatcToolbarSectionMarker");
                span.innerHTML = " *";
                div.appendChild(span);
            }

            var chev = document.createElement("span");
            css.add(chev, "MatcToolbarSectionChevron mdi mdi-chevron-down");
            div.appendChild(chev);

            return div;
        },



        createBigNumber(db, cntr, label, help) {
            var numberCntr = db.div("MatcToolBarNumberCntr MatcMarginTop").build(cntr);
            let l = db.div("MatcDashLabel", label).build(numberCntr);
            var main = db.div("MatcToolbarBigLabel").build(numberCntr);
            var little = db.div("MatcToolbarDetailLabel").build(numberCntr);
            if (help) {
                var node = db.span("mdi mdi-help-circle MatcHelpIcon").build(l);
                this.tempOwn(on(node, touch.press, lang.hitch(this, "showHelpDialog", help)));
            }

            return [main, little];
        },


        /********************************************************
         * Main menu handlers
         ********************************************************/

        onExit() {
            this.logger.log(0, "onExit", "entry", this.isPublic);
            if (this.isPublic) {
                hash("#/examples/" + this.model.id + "/design.html");
            } else {
                hash("#/apps/" + this.model.id + "/design.html");
            }
        },

        onShare() {
            this.logger.log(0, "onShare", "entry");
        },

        /********************************************************
         * Selection handlers!
         ********************************************************/

        onWidgetSelected(widget) {
            this.logger.log(2, "onWidgetSelected", "entry");

            /**
             * We might want to blur some stuff
             */
            if (this._selectedWidget && this._selectedWidget.id != widget.id) {
                this.logger.log(3, "onWidgetSelected", "exit > no new selection!");
                this.blurWidgetProperties();
            }


            this.cleanUp();


            this._selection = "widget";
            this._selectedWidget = widget;
            this.showWidgetProperties(widget);


            this.logger.log(3, "onWidgetSelected", "exit");
        },


        onScreenSelected(screen) {
            this.logger.log(-1, "onScreenSelected", "entry", this._selectedScreen);

            /**
             * We don not want to rerender on scroll
             */
            if (this._selectedScreen && this._selectedScreen.id == screen.id) {
                this.logger.log(3, "onScreenSelected", "exit > no new selection!");
                return;
            }

            this.cleanUp();
            this._selection = "screen";
            this._selectedScreen = screen;
            this.showScreenProperties(screen);


            this.logger.log(4, "onScreenSelected", "exit");
        },




        onLineSelected(line) {
            this.cleanUp();
            this._selection = "line";
            this._selectedLine = line;
        },



        onMultiSelect(selection) {
            this.cleanUp();

            this._selection = "multi";
            this._selectedMulti = selection;
        },

        onGroupSelect(group) {
            this.cleanUp();
            this._selection = "group";
            this._selectedGroup = group;
            this.showGroupProperties(group);
        },



        onCanvasSelected() {
            this.cleanUp();
            this.hideProperties();
        },


        /**
         * method which will update all properties. method is called from controller!
         */
        updatePropertiesView() {

            if (this._selectedWidget) {
                this.onWidgetSelected(this._selectedWidget);
            }
        },



        /********************************************************
         * Player
         ********************************************************/

        showSession(session, e) {
          
            const sessionID = session.session;
            const dialog = new Dialog();

            const db = new DomBuilder();

            const div = db.div("MatcDialog MatcPlayerDialog ").build();
            const cntr = db.div("").build(div);

            dialog.onOpen(() => {
                if (this.isPublic) {
                    Promise.all([
                        this.modelService.findPublicTagAnnotations(this.model.id),
                        this.modelService.findPublicMouseBySession(this.model.id, sessionID)
                    ]).then(values => {
                        this._showSession(sessionID, cntr, dialog, values);
                    });
                } else {
                    Promise.all([
                        this.modelService.findTagAnnotations(this.model.id),
                        this.modelService.findMouseBySession(this.model.id, sessionID)
                    ]).then(values => {
                        this._showSession(sessionID, cntr, dialog, values);
                    });
                }
            })

            dialog.popup(div, e.target);
        },

        _showSession(sessionID, cntr, dialog, data) {

            try {
                const mouse = data[1];

                const df = new DataFrame(this.events);
                df.sortBy("time");
                const sessionGroup = df.groupBy("session");
                const events = sessionGroup.get(sessionID);

                const player = this.$new(VideoPlayer);
                player.setDialog(dialog)
                player.placeAt(cntr);
                player.setModel(this.model);
                player.setTestSettings(this.testSettings)
                player.setMouse(mouse);
                player.setMouse(mouse);
                player.setSession(events, sessionID);


                dialog.own(on(dialog, "close", function () {
                    player.destroy();
                }));
            } catch (e) {
                console.error(e);
            }
        },

        _getSessionAnnotation(annotations, appID) {

            if (annotations.length > 1) {
                /**
                 * This should not happen, but we have seen it happeing. We delete this now...
                 */
                for (let i = 1; i < annotations.length; i++) {
                    var a = annotations[i];
                    this._doDelete("rest/annotations/apps/" + appID + "/" + a.id + ".json");
                }
            }

            if (annotations.length >= 1) {
                return annotations[0];
            } else {
                //console.debug("Create Tag annotation...");
                return {
                    appID: appID,
                    type: "tags",
                    reference: "",
                    sessions: {}
                };
            }
        },

        /********************************************************
         * Show Settings
         ********************************************************/


        onShowSettings(e) {

            var db = new DomBuilder();

            db = new DomBuilder();
            var popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

            var cntr = db.div("").build(popup);

            var settings = this.canvas.getSettings();


            /**
             * Themes
             */
            db.label("", "Theme :").build(cntr);
            var themeList = this.$new(RadioBoxList);
            themeList.setOptions([
                { value: "MatcDark", label: "Dark" },
                { value: "MatcLight", label: "Light" }
            ]);
            themeList.setValue(settings.canvasTheme);
            themeList.placeAt(cntr);



            /**
             * Mouse Wheel
             */
            db.label("MatcMarginTop", "Mouse Wheel / Touchpad Scroll :").build(cntr);
            var mouseWheelList = this.$new(RadioBoxList);
            mouseWheelList.setOptions([
                { value: "scroll", label: "Scroll Canvas" },
                { value: "zoom", label: "Zoom Canvas" }
            ]);
            mouseWheelList.setValue(settings.mouseWheelMode);
            mouseWheelList.placeAt(cntr);


            var bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
            var save = db.a("MatcButton MatcButtonPrimary", "Save").build(bar);
            var cancel = db.a(" MatcLinkButton ", "Cancel").build(bar);



            var dialog = new Dialog();
            dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
            dialog.own(on(save, touch.press, lang.hitch(this, "onSaveSettings", dialog, themeList, mouseWheelList)));

            dialog.popup(popup, e.target);

            this.canvas.enableMouseZoom(false);
            this.canvas.setState("simulate");

            this.logger.log(0, "onShowSettings", "exit > ");
        },

        onSaveSettings(dialog, themeList, mouseWheelList) {
            var settings = {
                canvasTheme: themeList.getValue(),
                mouseWheelMode: mouseWheelList.getValue()
            };

            this.canvas.setSettings(settings);
            this.canvas.enableMouseZoom(true);
            dialog.close();
        },


        /********************************************************
         * SignUp
         ********************************************************/


        showSignUpDialog(e) {

            var d = new Dialog();

            var db = new DomBuilder();

            var div = db.div("MatcDialog ").build();


            this._createSignUpForm(d, div);

            d.popup(div, e.target);
        },


        _createSignUpForm(d, div) {
            let f = this.$new(Form);
            f.render([
                {
                    label: "Email",
                    name: "email",
                    type: "text",
                    required: "true",
                    placeholder: "Your email",
                    css: "input-lg MatcIgnoreOnKeyPress",
                    error: "We need your email."
                },
                {
                    label: "Password",
                    name: "password",
                    type: "password",
                    min: 6,
                    placeholder: "Your password",
                    css: "input-lg MatcIgnoreOnKeyPress",
                    error: "The password should have at least six characters."
                },
                {
                    label: 'I have read the <a href="#/termsofservice.html" target="_blank">terms of service</a>',
                    name: "tos",
                    type: "check",
                    required: "true",
                    css: "MatcFormCheckBox MatcIgnoreOnKeyPress",
                    error: "You must accept the terms of service!"
                }
            ], [
                { label: "Cancel", css: "MatcLinkButton", click: lang.hitch(d, "close") },
                { label: "Create Free Account", css: "MatcButton MatchButtonGreen", click: lang.hitch(this, "_signUpAndNew", d, f) }
            ]);

            f.placeAt(div);
            f.startup();

            return f;
        },

        _signUpAndNew(dialog, form, data) {

            var valid = form.validateForm(null, true);

            if (valid) {

                result = this._doPost("rest/user", data);

                if (result.type == "error") {
                    if (result.errors.indexOf("user.email.not.unique") >= 0) {
                        form.showError("The email is already taken! Please enter another one!", "email");
                    } else {
                        form.showError("Something went wrong! Please try again!", "");
                    }

                    dialog.shake();
                } else {
                    dialog.close();

                    var result = this._doPost("rest/login/", data);
                    if (result.type != "error") {

                        window.location.href = "/my-account.html";

                    } else {
                        console.error("_signUpAndSave() > Could not sign in user");
                    }
                }
            } else {
                dialog.shake();
            }
        }
    },
    mounted() {
        this.db = new DomBuilder();
    }
}
</script>