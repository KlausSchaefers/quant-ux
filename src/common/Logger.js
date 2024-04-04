
var vommonLoggingQueue = []
var vommonLoggingQueuePos = 0
var vommonLoggingQueueMax = 50
var vommonLoggingDebugLevel = 0
var vommonLoggingErrorListener = null


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

	static setErrorCallback(callback) {
		vommonLoggingErrorListener = callback
	}

	setUser (){
	}

	writeQueue (){
		var q = "";
		try{
			vommonLoggingQueue.sort(function(a,b){
				return b.t -a.t;
			});
			for(var i=0; i < vommonLoggingQueue.length - 1; i++){
				if(vommonLoggingQueue[i]){
					q+= vommonLoggingQueue[i].m +"\n";
				}
			}
		} catch (e){
			console.error(e)
		}
		return q;
	}


	sendError (e){
		if (vommonLoggingErrorListener) {
			vommonLoggingErrorListener(e, this.writeQueue())
		} else {
			console.error('sendError() >> ', e)
		}
	}

	error (meth, message, error) {
		var m = this.className + "." + meth;
		console.error(m + " >> " + message);
		if(error){
			console.error(error.message);
			console.error(error.stack);
		}
		this.saveLog('ERROR', meth, message)
	}

	warn (method, message, obj){
		this.warning(0, method, message, obj);
		this.saveLog('WARN', method, message)
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
						console.info(m + " >> " + message, obj);
					} else {
						console.info(m + " >> " + message);
					}
				}
			}else{
				if (obj !== undefined){
					console.info(m + " >> " + message, obj);
				} else {
					console.info(m + " >> " + message);
				}
			}
		}
		this.saveLog('LOG', method, message)
	}

	saveLog(level, method, message) {
		var m = level + ':: ' + this.className + "." + method + " >> " + message;
		const entry = {
			t: new Date().getTime(),
			l: level,
			m : m+ " >> " + message
		}
		vommonLoggingQueue[vommonLoggingQueuePos] = entry;
		vommonLoggingQueuePos = (vommonLoggingQueuePos+1) % vommonLoggingQueueMax;
	}
}