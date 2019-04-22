
import lang from 'dojo/_base/lang'
import Evented from 'dojo/Evented'
import Logger from 'common/Logger'




export default class Router {
    constructor() {
        this.roles = {
            this."guest" = 0
            this."invited" = 1
            this."user" = 2
            this."staff" = 3
            this."admin" = 4
    }
    constructor: function(){
			this.logger = new Logger({className : "de.vommond.Router"});	
			this.tree = {name:"root", children: {}};
			this.routeCount = 0;
			this.instances = {};
			this.controllers={};
		}
		
		setContext (context){
			this.context = context;
			return this;
		}
		
		setUser (user){
			this.user = user;
			
			for(var id in this.instances){
				var instance = this.instances[id];
				instance._user = user;
			}
			return this;
		}
		
		setRoles (roles){
			this.roles = roles;
			return this;
		}
		
		controller (name, url){
			this.logger.log(3,"register","enter > " + name);
			this.controllers[name] = url;
			return this;
		}
		
		preload (ms){
			
			if(!ms){
				ms = 5000;
			}
			setTimeout(lang.hitch(this, "_preload"), ms);
		}
		
		_preload (){
			this.logger.log(3,"_preload","enter");
			
			for(var name in this.controllers){
				var url = this.controllers[name];
				this.load(url, function(i){});
			}
		}
		
		error (p1, p2){
			if(p1 instanceof Function){
				this.errorCallback = p1;
			} else {
				this.errorRequest = {
					controller : p1,
					method : p2	
				};
			}
			return this;
		}
		
		home (p1, p2){
			if(p1 instanceof Function){
				this.defaultCallback = callback;
			} else {
				this.defaultRequest = {
					controller : p1,
					method : p2	
				};
			}
			return this;
		}
		
		add (path, p1, p2, p3){
			
			/**
			 * split path and sort into prefix tree
			 */
			var parts = this._split(path);
			
			this.routeCount++;
			
			/**
			 * add to tree
			 */

			var node = this.tree;
			for(var i=0; i< parts.length; i++){
				var part = parts[i];
				if(node.children[part] == null){
					node.children[part] = {name : part, children: {} position : this.routeCount};
				}
				node = node.children[part];
			}
			
			/**
			 * The parameters have a different semantic depending on p1!
			 */
			if(p1 instanceof Function){
				node.callback = p1;
				node.role = p2;
			} else {
				node.controller = p1;
				node.method = p2;
				node.role = p3;
			}			
		
			
			return this;
		}
		
		
		dispatch (url, payload, event){
			this.logger.log(2,"dispatch","enter > '" + url + "'");
		
			try{
				/**
				 * 1) parse url
				 */
				var request = this.parse(url);

				if(request){
					request.source = event;
					
					/**
					 * mixing payload!
					 */
					if(payload){
						this.logger.log(4,"dispatch","Include payloud");
						for(var key in payload){
							if(request.params[key] == null || request.params[key] === undefined){
								request.params[key] = payload[key];
							} else {
								this.logger.warning(2,"dispatch","Cannot override parameter ", key);
							}
						}
							
					}
					
					/**
					 * if we have a user, check also security
					 */
					if(this.isAllowed(request)){
						
						if(request.callback){
							request.callback(request.params);
						} else {
							this.request(request);
						}
						
					} else {
						this._error("NotAllowedError", "The url '" + url + "' is not allowed for the user");
					}
					
				} else {
					this.logger.log(0,"dispatch","default");
					if(this.defaultRequest){
						this.request(this.defaultRequest);
					}else if (this.defaultCallback){
						this.defaultCallback();
					} else {
						this._error("NoRouteError","No route registered for url '" + url + "'");
					}
					
				}
			} catch(e){
				this.logger.error("dispatch","Error > '" + e.message + "'", e);
				this.logger.sendError(e);
			
			}
			
			
			
		}
		
		request (request){
			this.logger.log(3,"request","enter");
			var url = this.controllers[request.controller];
			if(url){
				this.load(url, lang.hitch(this, "execute", request));
			} else {
				this.load(request.controller, lang.hitch(this, "execute", request));
			}
		}
		
		execute (request, controller){
			this.logger.log(3,"execute","enter > " + request.method);
			
			/**
			 * Call cleanup method on last controller!
			 */
			if(this.current && this.current.cleanUp){
				this.current.cleanUp();
			}
			
			/**
			 * Call route change listeners!
			 */
			this.runRouterChangeListerns();
			
			if(controller){
				var method =request.method;
				this.current = controller;
				if(controller[method] && controller[method] instanceof Function){
					controller[method](request.params, request.source);
				} else {
					
					var publicMethods = controller.getPublicMethods();
					if(publicMethods && publicMethods[method]){
						var fct = publicMethods[method];
						var callback = lang.hitch(controller, fct);
						callback(request.params, request.source);
					} else {
						this._error("NoControllerMethod","No controller method '" + method + "'");
					}
					
				}
				
			} else {
				this._error("NoControllerLoaded","No controller loaded!");
			}
			this.logger.log(4,"execute","exit");
		}
		
		isAllowed (request){
			
			if(this.user && request.role){
				var userRole = this.roles[this.user.role];
				var requestRole = this.roles[request.role];
				
				if(userRole >= requestRole){
					return true;
				}  else {
					this.logger.error("isAllowed","not allowed! " + this.user.role);
					return false;
				}
			}
			
			return true;
		}
	
	
		
		
		parse (url){
			
			/**
			 * Split path
			 */
			var parts = this._split(url);
			
			/**
			 * start recursive parsing
			 */
			var result =  {
				controller : null, 
				method:null,
				callback:null,
				match : false,
				params:{}
				source : null
			};
			this._parse(parts, this.tree, 0, result);
			
			/**
			 * by convention we will return null, if there was no match!
			 */
			if(result.match){
				return result;
			} else {
				return null;
			}
			
			
		}
		
		/**
		 * Three things can happen:
		 * 
		 * 1) we have an exact match. In this case we walk recursivly
		 * down the tree!
		 */
		_parse (parts, node, i, result){
			
			//console.debug(this._space(i), "_parse(", "'" + parts[i] + "' , ",  i ,")" );
	
			var part = parts[i];
			
			if(node.children[part]){
				/**
				 * 1) check if we have a direct name match. This has higher priority
				 * than a paramter match
				 */
				node = node.children[part];
			
				if(i< parts.length-1){
					/**
					 * check if we have to go down recursive! 
					 */
					
					this._parse(parts, node, i+1, result); 
				} else {
					/**
					 * Otherwise break recursion
					 */
					result.match = true;
					result.controller = node.controller;
					result.method = node.method;
					result.callback = node.callback;
					result.role = node.role;
					return;
				}
			}else{

				/**
				 * 2) If no direct match, check if we have an parameter match.
				 * First check if we have parameters at this node, if so, test
				 * each parameter (in the order they were added).
				 */
				var params = this._getParams(node);
				if(params.length > 0){
				
					if(i< parts.length-1){
						/**
						 * 2a) if we are at NOT at the last part, check each parameter
						 * in continue recursion!
						 */
						for(var p=0; p < params.length; p++){
							var param = params[p];
					
							this._parse(parts, param, i+1, result); 
							
							/**
							 * if the p-th parameter matched, add the parameter value and
							 * return
							 */
							if(result.match){
								result.params[param.paramName] = part;
								break;
							} 
							
							
						}
					} else {
						/**
						 * 2b) Else we break the recursion if one of the parameters has an action!
						 */
						for(var p=0; p < params.length; p++){
							var param = params[p];
							
							if(param.controller != null || param.callback!=null){	
								result.match = true;
								result.controller = param.controller;
								result.method = param.method;
								result.callback = param.callback;
								result.params[param.paramName] = part;
								result.role = param.role;
								return;
							}
						}
						
					    /**
					     * else there is no match!
					     */
						result.match = false;
						result.controller = null;
						result.method = null;
						result.callback = null;
						result.role =null;
						return;
					}
				
					
				} else {

					/**
					 * 3) Also the parameters do not match. This means we have no match in this branch!
					 */
					result.match = false;
					result.controller = null;
					result.method = null;
					result.callback = null;
					result.role = null;
					return;
				}
			
				
			} 
				

		}
		
	
		

		load (url, callback){
			if(this.instances[url]){
				this.current = this.instances[url];
				callback(this.instances[url]);
			} else {
				var me = this;
				this.logger.log(2,"load","enter > " +url);
				require([url], function(obj){
					if(obj){
						var instance = new obj();
						instance.context = me.context;
						instance.log = new Logger({className : url});						
						
						/**
						 * Inject some methods for comfort
						 */
						instance.loadView = lang.hitch(me.context, "loadView");
						instance.loadHeader = lang.hitch(me.context, "loadHeader");
						instance.loadTemplate = lang.hitch(me.context, "loadTemplate");
						instance.setUser = lang.hitch(me.context, "setUser");
						instance._doGet = lang.hitch(me.context, "_doGet");
						instance._doPost = lang.hitch(me.context, "_doPost");
						instance._doDelete = lang.hitch(me.context, "_doDelete");
						instance._doMultiGet = lang.hitch(me.context, "_doMultiGet");
						instance.setDataBinding = lang.hitch(me.context, "setDataBinding");
						instance.tempOwn = lang.hitch(me.context, "tempOwn");
						instance.showDefaultMenu = lang.hitch(me.context, "showDefaultMenu");
						instance.showSuccess = lang.hitch(me.context, "showSuccess");
						instance.showError = lang.hitch(me.context, "showError");
						instance.showHint = lang.hitch(me.context, "showHint");
						instance.showToolBar = lang.hitch(me.context, "showToolBar");
						instance.getCanvasHeight = lang.hitch(me.context, "getCanvasHeight");
						instance.getNLS = lang.hitch(me.context, "getNLS");
						instance.removeLoaders = lang.hitch(me.context, "removeLoaders");
						instance.addRouteChangeListener = lang.hitch(me, "addRouteChangeListener");
						instance.logPageView = lang.hitch(me.context, "logPageView");
						instance._user = me.user;					
						
						me.instances[url] = instance;
						
						callback(instance);
					} else {
						var e = new Error("Could not require "+ url);
						this.logger.sendError(e);
					}
				});
			}
		}
		
		
		
		/**
		 * Return the current class that is executed!
		 */
		getCurrent (){
			return this.current;
		}
		
		/********************************************************************
		 * Callback handlers for router live cycle
		 ********************************************************************/
	
		addRouteChangeListener (callback) {
			this.logger.log(3,"addRouteChangeListener","enter > ");
			if (!this._routeChangeListeners) {
				this._routeChangeListeners = [];
			}
			this._routeChangeListeners.push(callback)
		}
		
		runRouterChangeListerns (){
			this.logger.log(4,"runRouterChangeListerns","enter > ");
			if (this._routeChangeListeners){
				this.logger.log(2,"runRouterChangeListerns","execute");
				for(var i=0; i < this._routeChangeListeners.length; i++){
					try{
						this._routeChangeListeners[i]();
					} catch(e) {
						this.logger.error("runRouterChangeListerns","Error", e);
					} 
				}
			}
			this.cleanUpRouterChangeListerns();
		}
		
		cleanUpRouterChangeListerns (){
			this.logger.log(-1,"cleanUpRouterChangeListerns","enter > ");
			delete this._routeChangeListeners;
		}
		
		
		/********************************************************************
		 * Helper Methods
		 ********************************************************************/
		
		_error (type, msg){
			this.logger.log(0,"_error","enter > " +type);
			if(this.errorRequest){
				// FIXME: clone the errorRequest
				this.errorRequest.params = {type:type, msg:msg};
				this.request(this.errorRequest);
			} else if(this.errorCallback){
				this.errorCallback({type:type, msg:msg});
			}
		}
		
		_space (i){
			s=" ";
			for(var x=0; x < i; x++)
				s+="   ";
			return s;
		}
		
		
		_getParams (node){
			
			if(!node._params){
				node._params = [];
				
				for(var part in node.children){
					if(part.indexOf(":") == 0){
						var child = node.children[part];
						child.paramName = part.substring(1, part.length);
						node._params.push(child);
					}
				}
				
				node._params.sort(function(a,b){
					return a.position - b.position;
				});
			}
			
			return node._params;
		}
		
		
		_split (s){
			if(s.indexOf("#") ===0){
				s = s.substring(1, s.length);
			}
			if(s.indexOf("/") ===0){
				s = s.substring(1, s.length);
			}
			
			if(s.indexOf("?") > 0){
				s = s.substring(0, s.indexOf("?"));
			}
			return s.split(/[.\/-]/);
		}
}