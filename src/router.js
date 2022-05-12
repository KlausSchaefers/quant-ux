import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)


let matcRoutes = []

matcRoutes.push({path:'my-account.html', component: () => import(/* webpackChunkName: "about" */ 'views/user/Account.vue')})
matcRoutes.push({path:'reset_password.html', component: () => import(/* webpackChunkName: "about" */ 'views/user/ResetPassword.vue')})
matcRoutes.push({path:'reset_password3.html', component: () => import(/* webpackChunkName: "about" */ 'views/user/ResetPassword.vue')})
matcRoutes.push({path:'404.html', component: () => import(/* webpackChunkName: "about" */ 'views/404.vue')})
matcRoutes.push({path:'logout.html', component: () => import(/* webpackChunkName: "about" */ 'views/LogoutPage.vue')})
matcRoutes.push({path:'help.html', component: () => import(/* webpackChunkName: "about" */ 'views/Help.vue')})
matcRoutes.push({path:'help/:topic.html', component: () => import(/* webpackChunkName: "about" */ 'views/Help.vue')})
matcRoutes.push({path:'help/:topic/:subtopic.html', component: () => import(/* webpackChunkName: "about" */ 'views/Help.vue')})
// Apps
matcRoutes.push({path:'', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue'),  meta: {isDarkHeader: true}})
matcRoutes.push({path:'my-apps.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue'), meta: {isDarkHeader: true}})
matcRoutes.push({path:'logged_in.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue'),  meta: {isDarkHeader: true}})
matcRoutes.push({path:'create-app.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Create.vue')})
matcRoutes.push({path:'tryout.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Create.vue'), meta: {isTryout:true}})
matcRoutes.push({path:'apps/:id.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Overview.vue')})
matcRoutes.push({path:'apps/:id/:tab.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Overview.vue')})
matcRoutes.push({path:'apps/:id/replay/:session.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Overview.vue')})


export default new VueRouter({
  routes: [
    {
      path: '/simulate.html',
      name: 'SimulatorPage',
      component: () => import(/* webpackChunkName: "simulator" */ 'views/simulator/SimulatorPage.vue')
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
      path: '/tryout2.html',
      name: 'TryoutEditor',
      meta: {isPublic:true},
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Tryout.vue')
    },
    {
      path: '/examples/:id/design/:sid.html',
      name: 'ExampleEditor',
      meta: {isPublic:true},
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
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Analyze.vue')
    },
    {
      path: '/examples/:id/analyze/workspace.html',
      name: 'ExampleAnalyticCanvasPage',
      meta: {isPublic:true},
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Analyze.vue')
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
    }
    //{
    //  path: '/test/Sketch.html',
    //  component: () => import(/* webpackChunkName: "unit" */ './unit/SketchTest.vue')
    // }
    //{
    //  path: '/test/paper.html',
    //  component: () => import(/* webpackChunkName: "unit" */ './unit/Paper.vue')
    //}
  ]
})