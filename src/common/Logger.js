
import request from '../dojo/request'
import Services from '../services/Services'

var vommonLoggingQueue = []
var vommonLoggingQueuePos = 0
var vommonLoggingQueueMax = 200
var vommonLoggingDebugLevel = 0
var vommondLoggingErros = 0

export default class Logger {

	constructor(className) {
		if (!className.toLowerCase) {
			console.warn('Logger.constructor called with params', className)
		}
		this.debugLevel = -1
		this.serverDebugLevel = 2
		this.prefix = null
		this.url = "/rest/log/error"
		this.className = className;
	}

	setUser (){
	}

	writeQueue (){
		var q = "";
		try{
			vommonLoggingQueue.sort(function(a,b){
				return b.t -a.t;
			});
			for(var i=0; i <vommonLoggingQueue.length-1; i++){
				if(vommonLoggingQueue[i]){
					q+=new Date(vommonLoggingQueue[i].t).toISOString() + " - "  + vommonLoggingQueue[i].m +"\n";
				}
			}
		} catch (e){
			console.error(e)
		}
		return q;
	}


	sendError (e){
		var plugins = "";
		for(var i=0;i<navigator.plugins.length;i++){
			plugins+=navigator.plugins[i].name + "/n";
		}

		if(vommondLoggingErros < 10){
			var q = this.writeQueue();
			let u = Services.getUserService().getUser();
			if (u) {
				u = {
					id: u.id,
					email: u.email
				}
			}

			var msg = {
				level : 0,
				url : location.href,
				message : e.message,
				stack : e.stack,
				ua : navigator.userAgent,
				appCodeName : navigator.appCodeName,
				appName : navigator.appName,
				platform : navigator.platform,
				user : u,
				plugins : plugins,
				queue : q
			};

			var params = {
				handleAs: "json",
				method : "post",
				sync: false,
				data : JSON.stringify(msg)
			};
			request(this.url, params).then(function (){

			}, function(err){
				console.warn("Logger.sendError() > could not send", err)
			});
			vommondLoggingErros++
		}
	}

	error (meth, message, error) {
		var m = this.className + "." + meth;
		console.error(m + " >> " + message);
		if(error){
			console.error(error.message);
			console.error(error.stack);
		}
	}

	warn (method, message, obj){
		this.warning(0, method, message, obj);
	}

	info (method, message, data1){
		this.log(1, method, message, data1);
	}

	debug (method, message, data1){
		this.log(4, method, message, data1);
	}

	warning (level,method, message, obj){
		var m = this.className + "."+method;
		if(vommonLoggingDebugLevel >= level){
			if(this.prefix){
				if(m.indexOf(this.prefix) == 0){
					if (obj) {
						console.warn(m + " >> " + message, obj);
					} else {
						console.warn(m + " >> " + message);
					}
				}
			} else{
				if (obj) {
					console.warn(m + " >> " + message, obj);
				} else {
					console.warn(m + " >> " + message);
				}
			}
		}
	}

	log (level, method, message, obj){
		var m = this.className + "."+method;
		if(vommonLoggingDebugLevel > level){
			if(this.prefix){
				if(m.indexOf(this.prefix) == 0){
					if (obj){
						console.debug(m + " >> " + message, obj);
					} else {
						console.debug(m + " >> " + message);
					}
				}
			}else{
				if (obj !== undefined){
					console.debug(m + " >> " + message, obj);
				} else {
					console.debug(m + " >> " + message);
				}
			}
		}

		if(this.serverDebugLevel > level){
			var entry = {
				t: new Date().getTime(),
				m : m+ " >> " + message
			}
			vommonLoggingQueue[vommonLoggingQueuePos] = entry;
			vommonLoggingQueuePos = (vommonLoggingQueuePos+1) % vommonLoggingQueueMax;
		}


	}
}