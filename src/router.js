import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)


let matcRoutes = []

matcRoutes.push({path:'my-account.html', component: () => import(/* webpackChunkName: "about" */ 'views/user/Account.vue'), meta: {hasHeader: true}})
matcRoutes.push({path:'404.html', component: () => import(/* webpackChunkName: "about" */ 'views/404.vue'), meta: {hasHeader: true}})
matcRoutes.push({path:'logout.html', component: () => import(/* webpackChunkName: "about" */ 'views/LogoutPage.vue'), meta: {hasHeader: true}})
matcRoutes.push({path:'help.html', component: () => import(/* webpackChunkName: "about" */ 'views/Help.vue'), meta: {hasHeader: true}})
matcRoutes.push({path:'help/:topic.html', component: () => import(/* webpackChunkName: "about" */ 'views/Help.vue'), meta: {hasHeader: true}})
matcRoutes.push({path:'help/:topic/:subtopic.html', component: () => import(/* webpackChunkName: "about" */ 'views/Help.vue'), meta: {hasHeader: true}})

// Studio
matcRoutes.push({path:'', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Studio.vue'),  meta: {hideHeader: true}})
matcRoutes.push({path:'apps/my-apps.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Studio.vue'), meta: {hideHeader: true}})
matcRoutes.push({path:'apps/logged_in.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Studio.vue'),  meta: {hideHeader: true}})
matcRoutes.push({path:'apps/:id.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Studio.vue'), meta: {hideHeader: true}})
matcRoutes.push({path:'apps/:id/:tab.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Studio.vue'), meta: {hideHeader: true}})
matcRoutes.push({path:'apps/:id/replay/:session.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Studio.vue'), meta: {hideHeader: true}})
matcRoutes.push({path:'apps/create-app.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Create.vue'), meta: {hideHeader: true}})
matcRoutes.push({path:'apps/tryout.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Create.vue'), meta: {hideHeader:true}})


// Apps
// matcRoutes.push({path:'', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue'),  meta: {isDarkHeader: true}})
// matcRoutes.push({path:'apps/my-apps.html', name: "apps_list", meta: {isHome:true, analytics:true}, component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue')})
// matcRoutes.push({path:'apps/logged_in.html', meta: {isHome:true}, component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue')})
// matcRoutes.push({path:'apps/create-app.html',  name: "apps_create",  meta: {isHome:false}, component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Create.vue')})
// matcRoutes.push({path:'apps/tryout.html',  name: "apps_tryout", component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Create.vue'), meta: {isTryout:true, isHome:false}})
// matcRoutes.push({path:'apps/:id.html',  name: "apps_overview", component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Overview.vue'), meta: {analytics:true}})
// matcRoutes.push({path:'apps/:id/:tab.html', name: "apps_overview_tab", component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Overview.vue'), meta: {analytics:true, analyticsKey:'tab'}})
// matcRoutes.push({path:'apps/:id/replay/:session.html', name: "apps_video", component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Overview.vue')})


export default new VueRouter({
  routes: [
    {
      path: '/simulate.html',
      name: 'SimulatorPage',
      component: () => import(/* webpackChunkName: "simulator" */ 'views/simulator/SimulatorPage.vue')
    },
    {
      path: '/tos.html',
      name: 'Tos',
      component: () => import(/* webpackChunkName: "simulator" */ 'views/Tos.vue'),
      meta: {hasHeader: true}
    },
    {
      path: '/privacy.html',
      name: 'Privacy',
      component: () => import(/* webpackChunkName: "simulator" */ 'views/Privacy.vue'),
      meta: {hasHeader: true}
    },
    {
      path: '/test.html',
      name: 'TestPage',
      component: () => import(/* webpackChunkName: "matc" */ 'views/simulator/TestPage.vue')
    },
    {
      path: '/test/mobile/:id.html',
      name: 'TestPageMobile',
      component: () => import(/* webpackChunkName: "matc" */ 'views/simulator/TestMobile.vue')
    },
    {
      path: '/apps/:id/create.html',
      name: 'Editor',
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Design.vue')
    },
    {
      path: '/apps/:id/design/:sid.html',
      name: 'ScreenEditor',
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Design.vue')
    },
    {
      path: '/share.html',
      name: 'SharePage',
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Share.vue')
    },
    {
      path: '/apps/:id/analyze/workspace.html',
      name: 'AnalyticCanvasPage',
      meta: {viewMode: 'Heatmap'},
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Design.vue')
    },
    {
      path: '/examples/:id/analyze/workspace.html',
      name: 'ExampleAnalyticCanvasPage',
      meta: {isPublic:true, viewMode: 'Heatmap'},
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Design.vue')
    },
    {
      path: '/',
      name: '',
      children: matcRoutes,
      component: () => import(/* webpackChunkName: "matc" */ 'views/QUX.vue')
    },
    {
      path: '/test/DojoTest.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/DojoTest.vue')
    },
    {
      path: '/test/Canvas.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/CanvasTest.vue')
    },
    {
      path: '/test/Rest.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/RestSettingsTest.vue')
    },
    {
      path: '/test/Sim.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/SimulatorTest.vue')
    },
    {
      path: '/test/Rule.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/RuleTest.vue')
    },
    {
      path: '/test/DataBindingTree.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/DataBindingTreeTest.vue')
    },
    {
      path: '/test/Tree.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TreeTest.vue')
    },
    {
      path: '/test/Layer.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/LayerTest.vue')
    },
    {
      path: '/test/Table.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TableConfTest.vue')
    },
    {
      path: '/test/SVG.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/SVGEditorTest.vue')
    },
    {
      path: '/test/Figma.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/FigmaTest.vue')
    },
    {
      path: '/test/Import.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ImportDialogTest.vue')
    },
    {
      path: '/test/Task.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TaskPerfGramTest.vue')
    },
    {
      path: '/test/Task.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TaskCreateDialogTest.vue')
    },
    {
      path: '/test/Color.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ColorPickerTest.vue')
    },
    {
      path: '/test/Export.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ExportTest.vue')
    },
    {
      path: '/test/WS.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/WebSocketTest.vue')
    },
    {
      path: '/test/StyledTable.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/StyledTableTest.vue')
    },
    {
      path: '/test/CondStyle.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ConditionalStyleTest.vue')
    },
    {
      path: '/test/JS.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/JSSandboxTest.vue')
    },
    {
      path: '/test/Perf.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/PerfTest.vue')
    },
    {
      path: '/test/BigData.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/BigDataTest.vue')
    },
    {
      path: '/test/HTMLImporter.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/HTMlImporterTest.vue')
    },
    {
      path: '/test/DesignGPT.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/DesignGPTTest.vue')
    },
    {
      path: '/test/DesignGPTChat.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/DesignGPTChatTest.vue')
    },
    {
      path: '/test/Outlier.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/OutlierTest.vue')
    },
    {
      path: '/test/Responsive.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ResponsiveTest.vue')
    },
    {
      path: '/test/Form.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/FormTest.vue')
    },
    {
      path: '/test/VSlider.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/VSliderTest.vue')
    },
    {
      path: '/test/CanvasComment.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/CanvasCommentTest.vue')
    },
    {
      path: '/test/Chat.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ChatHelpTest.vue')
    }
  ]
})