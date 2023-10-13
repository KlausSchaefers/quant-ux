(self["webpackChunkquant_ux"]=self["webpackChunkquant_ux"]||[]).push([[721],{88792:function(t,e,s){"use strict";s.r(e),s.d(e,{default:function(){return P}});var r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"Matc"},[t.isGuest?s("LoginPage",{attrs:{user:t.user},on:{login:t.onLogin}}):s("div",{staticClass:"MatcContainer"},[s("Header",{attrs:{user:t.user},on:{login:t.onLogin,logout:t.onLogout}}),s("router-view")],1)],1)},a=[],o=s(67906),i=s(16198),n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{class:"MatcLoginPage "+(t.resetToken?"MatcLoginPageReset":"MactMainGradient")},[t.isQuxAuth?s("div",{staticClass:"MatcLoginPageDialog"},[s("div",{staticClass:"MatcLoginPageContainer"},[t.resetToken?t._e():s("div",{staticClass:"MatcToolbarTabs MatcToolbarTabsBig"},[s("a",{class:{MatcToolbarTabActive:"login"===t.tab},on:{click:function(e){return t.setTab("login")}}},[t._v("Login")]),t.allowSignUp?s("a",{class:{MatcToolbarTabActive:"signup"===t.tab},on:{click:function(e){return t.setTab("signup")}}},[t._v("Sign Up")]):t._e()]),s("div",{class:" MatcLoginWrapper "+t.tab},[s("div",{staticClass:"MatcLoginContent"},[s("div",{staticClass:"MatcLoginPageSection"},[s("div",{staticClass:"MatcLoginPageForm"},[s("div",{staticClass:" form-group"},[s("label",{},[t._v("Email")]),s("input",{directives:[{name:"model",rawName:"v-model",value:t.email,expression:"email"}],staticClass:" form-control",attrs:{placeholder:"Your email",type:"text"},domProps:{value:t.email},on:{input:function(e){e.target.composing||(t.email=e.target.value)}}})]),s("div",{staticClass:" form-group has-feedback"},[s("label",{},[t._v("Password")]),s("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:" form-control",attrs:{placeholder:"Your password",type:"password"},domProps:{value:t.password},on:{keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.login.apply(null,arguments)},input:function(e){e.target.composing||(t.password=e.target.value)}}})])]),s("span",{directives:[{name:"show",rawName:"v-show",value:t.errorMessage,expression:"errorMessage"}],staticClass:"MatcErrorLabel"},[t._v(t._s(t.errorMessage))]),s("div",{staticClass:"MatcButtonBar"},[s("a",{staticClass:"MatcButton MatcButtonPrimary",on:{click:t.login}},[t._v("Login")]),t.hasLoginError?s("a",{staticClass:"MatcLinkButton",on:{click:t.requestPasswordReset}},[t._v("Reset Password")]):t._e()])])]),t._v(" "),s("div",{staticClass:"MatcLoginContent"},[s("div",{staticClass:"MatcLoginPageSection"},[s("div",{staticClass:"MatcLoginPageForm"},[s("div",{staticClass:" form-group"},[s("label",{},[t._v("Email")]),s("input",{directives:[{name:"model",rawName:"v-model",value:t.email,expression:"email"}],staticClass:" form-control",attrs:{placeholder:"Your email",type:"text"},domProps:{value:t.email},on:{input:function(e){e.target.composing||(t.email=e.target.value)}}})]),s("div",{staticClass:" form-group has-feedback"},[s("label",{},[t._v("Password")]),s("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:" form-control",attrs:{placeholder:"Your password",type:"password"},domProps:{value:t.password},on:{keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.signup.apply(null,arguments)},input:function(e){e.target.composing||(t.password=e.target.value)}}})]),s("div",{staticClass:" form-group has-feedback"},[s("div",{staticClass:"MatcCheckboxRow"},[s("CheckBox",{attrs:{label:""},model:{value:t.tos,callback:function(e){t.tos=e},expression:"tos"}}),s("span",{on:{click:function(e){t.tos=!0}}},[t._v("I accept the "),s("a",{attrs:{href:"#/tos.html",target:"_blank"}},[t._v("terms of service")])])],1)])]),s("span",{staticClass:"MatcErrorLabel"},[t._v(t._s(t.errorMessage))]),s("div",{staticClass:"MatcButtonBar"},[s("a",{staticClass:"MatcButton MatcButtonPrimary",on:{click:t.signup}},[t._v("SignUp")])])])]),t._v(" "),s("div",{staticClass:"MatcLoginContent"},[t.resetToken?s("div",{staticClass:"MatcLoginPageSection"},[s("div",{staticClass:"MatcLoginPageForm"},[s("div",{staticClass:" form-group"},[s("label",{},[t._v("Email")]),s("input",{directives:[{name:"model",rawName:"v-model",value:t.email,expression:"email"}],staticClass:" form-control",attrs:{placeholder:"Your email",type:"text"},domProps:{value:t.email},on:{input:function(e){e.target.composing||(t.email=e.target.value)}}})]),s("div",{staticClass:" form-group has-feedback"},[s("label",{},[t._v("New Password")]),s("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:" form-control",attrs:{placeholder:"The new password",type:"password"},domProps:{value:t.password},on:{input:function(e){e.target.composing||(t.password=e.target.value)}}})])]),s("span",{staticClass:"MatcErrorLabel"},[t._v(t._s(t.errorMessage))]),s("div",{staticClass:"MatcButtonBar"},[s("a",{staticClass:"MatcButton MatcButtonDanger",on:{click:t.resetPassword}},[t._v("Set new password")])])]):t._e()])])])]):t._e()])},l=[],c=s(77259),u=s(54524),d=s(71021),g={name:"Header",mixins:[],props:["user"],data:function(){return{hasLoginError:!1,resetToken:!1,email:"",password:"",tos:!1,errorMessage:" ",tab:"login",config:{}}},computed:{isQuxAuth:function(){return"keycloak"!==c.Z.getConfig().auth},allowSignUp:function(){return this.config&&this.config.user&&!0===this.config.user.allowSignUp}},watch:{user:function(t){this.logger.log(6,"watch","user >> "+t.email),this.user=t}},components:{CheckBox:d.Z},methods:{setTab:function(t){this.tab=t,this.errorMessage=" "},resetPassword:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){var s;return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t.logger.info("resetPassword","enter ",t.email),!(t.email.length<2)){e.next=4;break}return t.errorMessage="Please enter your email",e.abrupt("return");case 4:if(!(t.password.length<6)){e.next=7;break}return t.errorMessage="Password too short",e.abrupt("return");case 7:if(!(t.resetToken.length<6)){e.next=10;break}return t.errorMessage="Token is wrong",e.abrupt("return");case 10:return e.next=12,c.Z.getUserService().reset2(t.email,t.password,t.resetToken);case 12:s=e.sent,"error"===s.type?t.errorMessage="Someything is wrong":(t.errorMessage="",t.resetToken="",t.tab="login",t.$router.push("/"));case 14:case"end":return e.stop()}}),e)})))()},requestPasswordReset:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.logger.info("requestPasswordReset","enter ",t.email),e.next=3,c.Z.getUserService().reset(t.email);case 3:t.errorMessage="Check you mail.";case 4:case"end":return e.stop()}}),e)})))()},login:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){var s;return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.logger.info("login","enter ",t.email),e.next=3,c.Z.getUserService().login({email:t.email,password:t.password});case 3:s=e.sent,"error"==s.type?(t.$root.$emit("Error","Wrong login credentials"),t.errorMessage="Login is wrong",t.hasLoginError=!0):(t.$emit("login",s),t.$root.$emit("UserLogin",s),t.hasLoginError=!1);case 5:case"end":return e.stop()}}),e)})))()},signup:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){var s,r;return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t.logger.info("signup","enter ",t.email),!(t.password.length<6)){e.next=4;break}return t.errorMessage="Password too short",e.abrupt("return");case 4:if(!0===t.tos){e.next=7;break}return t.errorMessage="Please accept terms of service",e.abrupt("return");case 7:return e.next=9,c.Z.getUserService().signup({email:t.email,password:t.password,tos:t.tos});case 9:if(s=e.sent,"error"!=s.type){e.next=14;break}s.errors.indexOf("user.create.domain")>=0?t.errorMessage="Not the correct domain":s.errors.indexOf("user.create.nosignup")>=0?t.errorMessage="No sign-ups allowed.":s.errors.indexOf("user.email.not.unique")>=0?t.errorMessage="Email is taken":t.errorMessage="Password too short",e.next=20;break;case 14:return e.next=16,c.Z.getUserService().login({email:t.email,password:t.password});case 16:r=e.sent,t.$emit("login",r),t.$root.$emit("UserLogin",r),t.logger.log(-1,"signup","exit with login",t.email);case 20:case"end":return e.stop()}}),e)})))()},initKeyCloak:function(t){var e=c.Z.getUserService();e.init(t)}},mounted:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:t.logger=new u.Z("LoginPage"),t.resetToken=t.$route.query.id,t.resetToken&&t.resetToken.length>2&&(t.logger.log(-1,"mounted","reset "),t.tab="reset"),t.config=c.Z.getConfig(),t.logger.log(-1,"mounted","exit > ",t.config.user);case 5:case"end":return e.stop()}}),e)})))()}},h=g,p=s(1001),m=(0,p.Z)(h,n,l,!1,null,null,null),v=m.exports,f=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"MatcHeader",attrs:{id:""}},[t._m(0),s("div",{staticClass:"container MatcHeaderCenter"},[s("div",{staticClass:"MatcHeaderCenterLeft"},[s("a",{attrs:{href:"#/"}},[t._v(t._s(t.$t("header.my-prototypes")))]),s("a",{attrs:{href:"#/help.html"}},[t._v(t._s(t.$t("header.documentation")))])]),s("div",{staticClass:"MatcHeaderCenterRight"},[s("LanguagePicker",{on:{change:t.setLanguage}})],1)]),s("div",{staticClass:"MatcHeaderRight"},[s("a",{attrs:{href:"#/logout.html"}},[t._v(t._s(t.$t("header.logout")))]),s("a",{attrs:{href:"#/my-account.html"}},[t._v(t._s(t.$t("header.my-account")))])])])},w=[function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"MatcHeaderLeft"},[r("img",{staticClass:"MatcHeaderLogo",attrs:{src:s(96075)}}),r("a",{attrs:{href:"#/"}},[t._v(" Quant-UX ")])])}],M=s(54953),k=s(99798),C={name:"Header",mixins:[],props:["user"],data:function(){return{}},watch:{user:function(t){this.logger.log(6,"watch","user >> "+t.email),this.user=t}},components:{LanguagePicker:k.Z},methods:{setLanguage:function(t){this.logger.log(-1,"setLanguage","entry",t),c.Z.getUserService().setLanguage(t),this.$root.$i18n.locale=t,this.$root.$emit("Success",this.$i18n.t("common.language-changed"))},logout:function(){this.logger.log(2,"logout","entry"),c.Z.getUserService().logout(),this.$emit("logout",c.Z.getUserService().GUEST),(0,M.Z)("/",!0)}},mounted:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:t.logger=new u.Z("Header"),t.logger.log(7,"mounted","exit >> "+t.user.email);case 2:case"end":return e.stop()}}),e)})))()}},b=C,T=(0,p.Z)(b,f,w,!1,null,null,null),S=T.exports,x=s(78651),_=s(28379),y={name:"home",mixins:[],data:function(){return{user:{id:-1,name:"Guest",email:"guest@quant-ux.com",role:"guest",lastlogin:0,lastNotification:0,tos:!1,paidUntil:0,plan:"Free"}}},components:{Header:S,LoginPage:v},computed:{isGuest:function(){return"guest"===this.user.role}},methods:{onLogin:function(t){this.user=t,this.logger.info("onLogin","exit >> "+this.user.email)},onLogout:function(t){this.user=t,this.logger.info("onLogin","exit >> "+this.user.email)},scrollTop:function(){window.scrollTo(0,0)}},watch:{$route:function(){_.Z.remove(x.Z.body(),"MatcPublic"),_.Z.remove(x.Z.body(),"MatcVisualEditor"),_.Z.remove(x.Z.body(),"MatcLight"),this.scrollTop(),this.$route.meta.isDarkHeader?_.Z.add(x.Z.body(),"MatcDarkHeaderPage"):_.Z.remove(x.Z.body(),"MatcDarkHeaderPage")}},mounted:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.logger=new u.Z("QUX"),e.next=3,c.Z.getUserService().load();case 3:t.user=e.sent,t.logger.log(-1,"mounted","locale: "+navigator.language),t.$root.$on("MatcLogout",(function(e){t.onLogout(e)}));case 6:case"end":return e.stop()}}),e)})))()}},Z=y,L=(0,p.Z)(Z,r,a,!1,null,null,null),P=L.exports},83470:function(t,e,s){"use strict";s.r(e),s.d(e,{default:function(){return h}});var r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"MatcApps"},[t._v(" Loading... ")])},a=[],o=s(67906),i=s(16198),n=s(54524),l=s(77259),c={name:"Overview",mixins:[],data:function(){return{}},mounted:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){var s,r,a,i,c,u;return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.logger=new n.Z("TestMobile"),s=t.$route.params.id,r=l.Z.getModelService(t.$route),e.next=5,r.findInvitation(s);case 5:for(c in a=e.sent,i={},a)i[a[c]]=c;u=i[1],t.logger.info("mounted","exit > "+u),location.href="#/simulate.html?qr=true&h=".concat(u);case 11:case"end":return e.stop()}}),e)})))()}},u=c,d=s(1001),g=(0,d.Z)(u,r,a,!1,null,null,null),h=g.exports},15484:function(t,e,s){"use strict";s.r(e),s.d(e,{default:function(){return P}});var r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{class:["MatcPublic",{MatcWindows:t.hasWindows}]},[t.step<10?s("div",{class:["MatcTest",{MatcTestCustomSplash:t.hasSplash}]},[t.hasSplash?s("div",{staticClass:"MatcTestCustomSplashPowered"},[t._v("Powered by Quant-UX")]):t._e(),t.hasSettings?s("div",{staticClass:"MatcTestMenu MatcTestMenuMax MactMainGradient",style:t.splashBackground,attrs:{"data-dojo-attach-point":"overlay"}},[s("div",{class:["MatcTestLogoCntr",{MatcTestLogoCntrMax:t.step>1}]},[s("div",{class:["MatcTestProgressCntr"]},[s("div",{staticClass:"MatcTestProgressBar"}),s("transition",{attrs:{name:"fade"}},[t.step>2?s("div",[6===t.step?s("div",{staticClass:"MatcTestContent"},[s("div",{staticClass:"MatcTestContentCntr"},[s("h2",[t._v(t._s(t.getNLS("simulator.password.title"))+" ")]),s("p",{domProps:{innerHTML:t._s(t.getNLS("simulator.password.msg"))}}),s("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:"form-control",domProps:{value:t.password},on:{keypress:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.setPassword.apply(null,arguments)},input:function(e){e.target.composing||(t.password=e.target.value)}}}),s("div",{staticClass:"MatcButton MatcMarginTop",on:{click:function(e){return t.setPassword()}}},[t._v(" "+t._s(t.getNLS("simulator.password.next"))+" ")]),s("span",{staticClass:"MatcError",staticStyle:{"margin-left":"20px"}},[t._v(" "+t._s(t.passwordError)+" ")])])]):t._e(),3===t.step?s("div",{staticClass:"MatcTestContent"},[s("div",{staticClass:"MatcTestContentCntr"},[s("h2",[t._v(" "+t._s(t.getNLS("simulator.welcome.title"))+" !")]),t.settings.description?s("p",[t._v(" "+t._s(t.settings.description)+" ")]):s("p",{domProps:{innerHTML:t._s(t.getNlSWithReplacement("simulator.welcome.msg",{name:t.model.name}))}}),s("p",{domProps:{innerHTML:t._s(t.getNLS("simulator.welcome.privacy"))}})]),s("div",{staticClass:"MatcMarginTop"},[0===t.getUserTasks().length?s("div",{staticClass:"MatcButton MatcButtonPrimary MatcTestStartButton",on:{click:function(e){return t.renderTest()}}},[t._v(" "+t._s(t.getNLS("simulator.welcome.start"))+" ")]):s("div",{staticClass:"MatcButton MatcButtonPrimary MatcTestStartButton",on:{click:function(e){return t.renderTasks()}}},[t._v(" "+t._s(t.getNLS("simulator.welcome.showTasks"))+" ")])])]):t._e(),4===t.step?s("div",{staticClass:"MatcTestContent"},[s("div",{staticClass:"MatcTestContentCntr"},[s("h2",[t._v(t._s(t.getNLS("simulator.tasks.title"))+" !")]),s("p",[t._v(" "+t._s(t.getNLS("simulator.tasks.msg"))+" ")]),t._l(t.getUserTasks(),(function(e){return s("div",{key:e.id},[s("h3",[t._v(t._s(e.name))]),s("div",{staticClass:"MatcTestTaskDescription"},[t._v(" "+t._s(e.description)+" ")])])}))],2),s("div",{staticClass:"MatcMarginTop"},[s("div",{staticClass:"MatcButton MatcButtonPrimary MatcTestStartButton",on:{click:function(e){return t.renderTest()}}},[t._v(" "+t._s(t.getNLS("simulator.welcome.start"))+" ")])])]):t._e()]):t._e()])],1),0==t.step?s("transition",{attrs:{name:"logoFade"}},[s("div",{staticClass:"MatcLogoNew MatcSimulatorLoadingLogoAnimation"})]):t._e()],1)]):t._e()]):t._e(),s("div",{staticClass:"MatcTestCntr"},[t.showTasks?s("div",{ref:"tastCntr",staticClass:"MatcTestTaskCntr MatcTestContent"},[s("h1",[t._v(t._s(t.getNLS("simulator.tasks.title"))+" ")]),s("p",[t._v(" "+t._s(t.getNLS("simulator.tasks.msg"))+" ")]),t._l(t.getUserTasks(),(function(e,r){return s("div",{key:e.id,class:{MatcTestTaskDone:t.taskDone[e.id]}},[s("h3",[t._v("#"+t._s(r+1)+" - "+t._s(e.name)+" "),t.taskDone[e.id]?s("span",{staticClass:"mdi mdi-check-circle"}):t._e()]),s("div",{staticClass:"MatcTestTaskDescription"},[t._v(" "+t._s(e.description)+" ")])])}))],2):t._e(),s("div",{ref:"cntr",staticClass:"MatcTest"})]),t.step<=1?s("div",{staticClass:"MatcTestVersion"},[t._v(" v4.3.30 ")]):t._e()])},a=[],o=s(67906),i=s(16198),n=s(62032),l=(s(92222),s(57327),s(41539),s(69720),s(47042),s(82526),s(41817),s(54747),s(52666)),c=s(28379),u=s(59344),d=s(78651),g=s(48039),h=s(75790),p=s(54524),m=s(17386),v=s(72712),f=s(96200),w=s(78449),M=s(77259),k=s(87838),C=s(49799),b=s(75840),T=s(3270),S=s(43371),x=s(67265),_={name:"TestPage",mixins:[v.Z,l.Z],data:function(){return{true:!1,skipSplash:!1,desktopScaleDirection:"width",desktopOffset:0,settings:null,logging:!0,model:null,step:0,password:"",passwordError:"",simulatorEvents:[],taskDone:{},splashImage:null,forceSimpleBar:!1}},components:{},computed:{hasWindows:function(){return navigator.platform.indexOf("Win")>-1},hasSplash:function(){return null!==this.splashImage},showTasks:function(){return!(!this.settings||!this.settings.showTaskInTest)},hasSettings:function(){return null!==this.settings},menuWidth:function(){return this.settings&&this.settings.showTaskInTest?400:0},splashBackground:function(){return this.splashImage?"background-image: url(/rest/images/".concat(this.hash,"/").concat(this.splashImage.url,");"):""}},methods:{postCreate:function(){this.logger=new p.Z("TestPage");var t=this.getHashFromUri();this.logger.log(2,"postCreate","enter",t);var e=this.$route.query.log;if(this.analytics=new T.Z,this.initNLS(),(0,w.Z)("android")||(0,w.Z)("ios")){var s="/#/simulate.html?qr=true&h="+t;return s+="false"==e?"&log=false":"&log=true",s+=this.getDataQuery(),void(location=s)}this.db=new m.Z,"true"===this.$route.query.s&&(this.logger.log(-1,"postCreate","skipSplash"),this.skipSplash=!0),setTimeout(u.Z.hitch(this,"loadModel"),1),this.logger.log(1,"postCreate","exit")},getDataQuery:function(){var t,e="",s=Object.entries(this.$route.query).filter((function(t){return"data_"==t[0].slice(0,5)})),r=(0,n.Z)(s);try{for(r.s();!(t=r.n()).done;){var a=t.value;e+="&"+a[0]+"="+a[1]}}catch(o){r.e(o)}finally{r.f()}return e},loadModel:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){var s;return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:t.logger.log(2,"loadModel","enter"),s=t.getHashFromUri(),s&&s.length<60?t.showPassword():t.loadModelFromHash(s);case 3:case"end":return e.stop()}}),e)})))()},showPassword:function(){this.logger.log(2,"showPassword","enter"),this.step=6},setPassword:function(){var t=this;return(0,i.Z)((0,o.Z)().mark((function e(){var s,r,a;return(0,o.Z)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.logger.log(1,"setPassword","enter",t.password),s=t.getHashFromUri(),r=s+t.password,e.prev=3,e.next=6,M.Z.getModelService().findAppByHash(r);case 6:a=e.sent,a?(t.passwordError="",t.loadModelFromHash(r)):t.showPasswordError(),e.next=13;break;case 10:e.prev=10,e.t0=e["catch"](3),t.showPasswordError();case 13:case"end":return e.stop()}}),e,null,[[3,10]])})))()},showPasswordError:function(){this.passwordError="The password is wrong."},loadModelFromHash:function(t){var e=this;return(0,i.Z)((0,o.Z)().mark((function s(){var r;return(0,o.Z)().wrap((function(s){while(1)switch(s.prev=s.next){case 0:if(e.hash=t,!t){s.next=8;break}return s.next=4,M.Z.getModelService().findAppByHash(t);case 4:r=s.sent,e.setModel(r),s.next=9;break;case 8:console.debug("loadModel() > Hash is missing in url");case 9:"false"===e.$route.query.log&&(e.logger.log(0,"loadModel","turn off logging"),e.logging=!1),e.screenID=e.$route.query.s,e.debug="true"===e.$route.query.debug;case 12:case"end":return s.stop()}}),s)})))()},getHashFromUri:function(){return this.$route.query.a&&this.$route.query.b?Math.random()>.5?(this.logger.log(0,"getHashFromUri","Test version A"),this.$route.query.a):(this.logger.log(0,"getHashFromUri","Test version B"),this.$route.query.b):this.$route.query.h},setModel:function(t){var e=this;return(0,i.Z)((0,o.Z)().mark((function s(){var r;return(0,o.Z)().wrap((function(s){while(1)switch(s.prev=s.next){case 0:if(e.logger.log(2,"setModel","enter > "+t),!t){s.next=10;break}return e.model=t,s.next=5,M.Z.getModelService().findTestByHash(e.model,e.hash);case 5:r=s.sent,e.setTestsettings(r),e.preloadImages(t),s.next=12;break;case 10:e.domNode.innerHTML="Sorry, the invitation is not valid...",location.href=location.protocol+"//"+location.host+"/404.html";case 12:case"end":return s.stop()}}),s)})))()},capitalizeFirstLetter:function(t){return t.charAt(0).toUpperCase()+t.slice(1)},setTestsettings:function(t){this.logger.log(1,"setTestsettings","enter > ",t),this.settings=t,this.setCustomSplash(t),this.debug||this.skipSplash?setTimeout(u.Z.hitch(this,"renderTest"),0):setTimeout(u.Z.hitch(this,"hideLogo"),500)},setCustomSplash:function(t){this.logger.log(1,"setCustomSplash","enter > ",t),t.splash&&(this.splashImage=t.splash)},hideLogo:function(){this.logger.log(1,"hideLogo","enter"),this.step=1,setTimeout(u.Z.hitch(this,"expandWindow"),500)},expandWindow:function(){this.logger.log(1,"expandWindow","enter"),this.step=2,setTimeout(u.Z.hitch(this,"renderSettings"),1e3)},renderSettings:function(){this.logger.log(2,"renderSettings","enter"),this.step=3},renderTasks:function(){this.logger.log(2,"renderTasks","enter"),this.step=4},getUserTasks:function(){var t=[];if(this.settings.tasks&&this.settings.tasks)for(var e=0;e<this.settings.tasks.length;e++){var s=this.settings.tasks[e];s.description&&"Enter a description here"!=s.description&&t.push(s)}return t},getPricacy:function(){return this.getNLS("test.welcome.privacy")},preloadImages:function(t){this.logger.log(-1,"preloadImages","enter"),C.Z.load(t,this.hash,this.domNode)},renderTest:function(){if(this.logger.log(-1,"renderTest","enter",this.settings.showTaskInTest),this.step=10,c.Z.remove(this.overlay,"MatcTestMenuMax"),this.renderSimulator(),"desktop"!=this.model.type){var t=this.db.div("MatcTestQRButton  MatcAnimated MatcFadeOut").build(this.domNode);this.db.span("mdi mdi-qrcode MatcMiddle").build(t),this.own((0,g.Z)(t,h.Z.press,u.Z.hitch(this,"showQRDialog"))),setTimeout((function(){c.Z.remove(t,"MatcFadeOut")}),1500)}},showQRDialog:function(t){this.stopEvent(t);var e=this.db.div("MatchTestQRDialog MatcPadding").build(),s=this.db.img().build(e);c.Z.add(s,"MatcSimulatorQR"),b.Z.getQRCode(this.hash,!0,!1,this.getLanguage(),this.getDataQuery()).then((function(t){s.src=t})),this.db.div("MatcHint MatchTestQRDialogHint",this.getNLS("test.qr.headline")).build(e);var r=new f.Z;r.popup(e,t.target)},onSimulatorEvent:function(t){var e=this;this.simulatorEvents.push(t);var s=new S.Z(this.simulatorEvents);s=this.getActionEvents(s);var r=this.settings.tasks,a=this.analytics.getTaskPerformance(s,r,!0);a.data.forEach((function(t){e.$set(e.taskDone,t.task,!0)}))},renderSimulator:function(){var t=d.Z.getBox();t.w-=this.menuWidth;var e=this.db.div("MatcSimulatorSection").build();return e.style.top="0px",e.style.left=this.menuWidth+"px",e.style.width=t.w+"px",this.$refs.cntr.appendChild(e),"desktop"==this.model.type?this.simulator=this.renderDesktopSimulator(e,t):this.simulator=this.renderMobileSimulator(e,t),e},renderMobileSimulator:function(t,e){var s=this;this.logger.log(0,"renderMobileSimulator","enter > "+e.w+","+e.h),c.Z.add(d.Z.body(),"MatcTestMobile");var r=.75,a={w:Math.floor(e.w*r),h:Math.floor(e.h*r)},o=this.model.screenSize;a.h<this.model.screenSize.h&&(this.logger.log(-1,"renderMobileSimulator","scale down..."),o=this.getScaledSize(a,"height",this.model));var i=this.db.div("MatcCenter").build(t),n=this.db.div("MatchSimulatorWrapper").build(i);n.style.width=Math.round(o.w)+"px",n.style.height=Math.round(o.h)+"px";var l=this.db.div("MatchSimulatorContainer").build(n);l.style.width=Math.round(o.w)+"px",l.style.height=Math.round(o.h)+"px";var u=x.n(l,this.forceSimpleBar),g=this.createSimulator();return g.setResizeListener((function(t){s.logger.log(-1,"renderMobileSimulator","resize",t.w+"/"+t.h),n.style.height=t.h+"px",n.style.width=t.w+"px",l.style.height=t.h+"px",l.style.width=t.w+"px"})),g.setInvitation(this.hash),g.isDesktopTest=!0,g.scrollListenTarget=u?"simpleBar":"parent",g.placeAt(l),g.setModel(this.model),this.logger.log(0,"renderMobileSimulator","exit",o),g},renderDesktopSimulator:function(t,e){var s=this;this.logger.log(2,"renderDesktopSimulator","enter ");var r=this.getDesktopScaleFactor(e);e.w-=64;var a={w:Math.floor(e.w*r),h:Math.floor(e.h*r)},o=this.model.screenSize;a.w<this.model.screenSize.w&&(this.logger.log(0,"renderDesktopSimulator","scale down by width..."),o=this.getScaledSize(a,"width",this.model));var i=this.db.div("MatcCenter").build(t),n=this.db.div("MatchSimulatorWrapper").build(i);n.style.width=Math.round(o.w)+"px",n.style.height=Math.round(o.h)+"px";var l=this.db.div("MatchSimulatorContainer").build(n);l.style.width=Math.round(o.w)+"px",l.style.height=Math.round(o.h)+"px";var c=x.n(l,this.forceSimpleBar),u=this.createSimulator();return u.setResizeListener((function(t){s.logger.log(-1,"renderMobileSimulator","resize",t.w+"/"+t.h),n.style.height=t.h+"px",n.style.width=t.w+"px",l.style.height=t.h+"px",l.style.width=t.w+"px"})),u.mode="width",u.isDesktopTest=!0,u.setInvitation(this.hash),u.placeAt(l),u.scrollListenTarget=c?"simpleBar":"parent",u.startup(),u.setModel(this.model),this.logger.log(2,"renderDesktopSimulator","exit"),u},getDesktopScaleFactor:function(t){var e=(t.w-this.desktopOffset)/t.w;return Math.min(1,e)},createSimulator:function(){var t=this;if(this.debug){var e=this.$new(k.Z);return e.on("event",(function(e){return t.onSimulatorEvent(e)})),e.mode="debug",e.logData=!1,e}var s=this.$new(k.Z);return s.on("event",(function(e){return t.onSimulatorEvent(e)})),s.mode="debug",s.logData=this.logging,s.applyTestSettings(this.settings),s}},mounted:function(){c.Z.add(d.Z.body(),"MatcPublic"),this.forceSimpleBar&&console.error("forceSimpleBar")}},y=_,Z=s(1001),L=(0,Z.Z)(y,r,a,!1,null,null,null),P=L.exports},69720:function(t,e,s){var r=s(82109),a=s(44699).entries;r({target:"Object",stat:!0},{entries:function(t){return a(t)}})}}]);
//# sourceMappingURL=matc-legacy.7516effb.js.map