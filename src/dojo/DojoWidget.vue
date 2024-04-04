<template>
  <div class="home"></div>
</template>

<script>
import * as DojoUtil from './DojoUtil';
import request from "dojo/request";
import topic from "dojo/topic";
import registry from 'dojo/registry'
import NLS from 'common/NLS'
import _Touch from "common/_Touch";

var _xhrLastRequest = {};

export default {
  name: "DojoWidget",
  mixins: [NLS, _Touch],
  components: {},
  data: function() {
    return {
      dojoInited: false
    };
  },
  methods: {
    stopPropagation (e) {
      if (e && e.stopPropagation){
        e.stopPropagation()
      }
    },
    stopEvent(e) {
      try {
        if (e && e.stopPropagation) {
          e.stopPropagation();
          e.preventDefault();
        }
      } catch (err){
        console.warn('DojoWidget.stopEvent', err, e)
      }

    },
    $new(cls, params) {
      return DojoUtil.$new(cls, params)
    },
    /**
     * dijit stuff
     */

    inherited () {
      console.error('Inherted called....', arguments, new Error().stack)
    },

    placeAt(node) {
      if (node && node.toLowerCase) {
        node = document.getElementById(node);
      }
      node.appendChild(this.$el);
      this.afterPlaceAt()
    },

    afterPlaceAt () {
    },

    initDomNodes() {
      this.domNode = this.$el;
      if (this.domNode) {
        if (this.domNode.querySelectorAll) {
          let attachPoints = this.domNode.querySelectorAll("[data-dojo-attach-point]");
          attachPoints.forEach(element => {
            let name = element.getAttribute("data-dojo-attach-point");
            if (!this[name]) {
              this[name] = element;
            }
          });
        } else {
          console.warn('initDomNodes', this)
        }
      } else {
        console.warn('no domnode for', this.name)
      }
    },

    /**
     * Template method for children to be compatible to dojo
     * life cycle
     */
    postCreate() {
    },

    /**
     * Template method for children to be compatible to dojo
     * life cycle
     */
    startup () {
    },

    tempOwn (listener) {
      if (!listener || !listener.remove) {
          console.error('tempOwn() > wrong object passed!', new Error().stack)
      }
      if(!this._dojoTempListener){
        this._dojoTempListener = []
      }
      this._dojoTempListener.push(listener)
    },

    cleanUpTempListener (){
 
			if(this._dojoTempListener){
        for(let i=0; i < this._dojoTempListener.length; i++){
          try {
					  this._dojoTempListener[i].remove();
          } catch (e) {
            console.error('cleanUpTemp,', this.name, e.stack)
          }
				}
				this._dojoTempListener = null;
			}
		},
    /**
     * Evented TODO: Use evented mixin. Does not work, dunno why
     */
    own(listener) {
      this._dojoListener.push(listener);
    },
    emit(event, value1, value2, value3, value4, value5) {
      this.$emit(event, value1, value2, value3, value4, value5);
      if (this._dojoWidgetEventListener[event]) {
        let listeners = this._dojoWidgetEventListener[event];
        listeners.forEach(listener => {
          listener.callback(value1, value2, value3, value4, value5);
        });
      }
    },
    _dojoCleanUpOwn() {
      this._dojoListener.forEach(l => {
        try {
          l.remove();
        } catch (e) {
          console.error("DojoWidget._dojoCleanUpOwn() >> ERROR", e);
        }
      });
    },
    _dojoCleanUpEvent () {
      for (let key in this._dojoWidgetEventListener){
        let listeners = this._dojoWidgetEventListener[key]
        listeners.forEach(l => {
          try {
            l.remove();
          } catch (e) {
            console.error("DojoWidget._dojoCleanUpOwn() >> ERROR", e);
          }
        });
      }

    },
    on(event, callback) {
      if (!this._dojoWidgetEventListener[event]) {
        this._dojoWidgetEventListener[event] = [];
      }
      let id = this._dojoWidgetEventListenerCounter++
      let listener = {
          'event': event,
          'callback': callback,
          'id': id,
          'remove': () => {
              this._removeListener(event, id)
          }
        }
      this._dojoWidgetEventListener[event].push(listener);
      return listener
    },

    _removeListener(event, id) {
      if (this._dojoWidgetEventListener[event]) {
        this._dojoWidgetEventListener[event] = this._dojoWidgetEventListener[event].filter(l => l.id !== id)
      }
    },

    /**
     * HTTP stuff
     */
    _doGet(url, callback) {
      return this._request(url, null, callback, "GET");
    },

    _doPost(url, data, callback) {
      this.clearXHRCache();
      return this._request(url, data, callback, "POST");
    },

    _doPut(url, data, callback) {
      this.clearXHRCache();
      return this._request(url, data, callback, "PUT");
    },

    _doDelete(url, data, callback) {
      this.clearXHRCache();
      return this._request(url, data, callback, "DELETE");
    },

    clearXHRCache() {
      this._xhrGetCache = {};
    },

    _setXHRCache(url, data, method) {
      if (method === "GET") {
        this._xhrGetCache[url] = {
          ts: new Date().getTime(),
          data: data
        };
      } else {
        this._xhrGetCache = {};
      }
    },

    _getXHRCache: function(url, method) {
      if (method === "GET") {
        var entry = this._xhrGetCache[url];
        if (entry) {
          var now = new Date().getTime();
          if (now - entry.ts < 10000) {
            return entry.data;
          }
        }
      }
      return false;
    },

    _request: function(url, data, callback, method) {
      /**
       * Check cache
       */
      var cachedData = this._getXHRCache(url, method);
      if (cachedData) {
        if (!callback) {
          return cachedData;
        } else {
          if (this[callback]) {
            this[callback](cachedData);
          } else {
            callback(cachedData);
          }
        }
        return;
      }

      /**
       * No cache hit;
       */
      var sync = true;
      if (callback) {
        sync = false;
      }
      var host = window.location.hostname;
      var params = {
        handleAs: "json",
        method: method,
        sync: sync,
        headers: {
          app: host
        }
      };

      if (data) {
        params.data = JSON.stringify(data);
      }

      var me = this;
      var result = null;
      request(url, params).then(
        function(data) {
          console.debug('request() > ', url, data)
          _xhrLastRequest["default"] = new Date().getTime();
          me._setXHRCache(url, data, method);
          if (!callback) {
            result = data;
          } else {
            if (me[callback]) {
              me[callback](data);
            } else {
              callback(data);
            }
          }
        },
        function(err) {
          var now = new Date().getTime();
          var dif = Math.round((now - _xhrLastRequest["default"]) / 1000);
          if (err && err.response && err.response.status === 401) {
            topic.publish("de/vommond/RequestError", url, err, dif);
          } else {
            if (me[callback]) {
              me[callback](null);
            } else {
              callback(null);
            }
          }
        }
      );
      return result;
    },

    /**
     * Do some get request in parallel and wait for their response.
     * Once all results are there, the call back will be called!
     */
    _doMultiGet(urls, callback) {
      var count = urls.length;
      var result = [];
      var me = this;
      var fired = false;
      var x = 0;
      var resultCollector = function(i, data) {
        if (data == null) {
          console.error("_Widget._doMultiGet() returnd null");
        }
        result[i] = data;
        x++;
        if (x == count && !fired) {
          if (me[callback]) {
            me[callback](result);
          } else {
            callback(result);
          }
        }
      };

      for (var i = 0; i < count; i++) {
        var url = urls[i];
        this._doGetWithClosure(url, i, resultCollector);
      }
    },

    _doGetWithClosure(url, i, callback) {
      request(url, {
        handleAs: "json",
        method: "GET",
        sync: false
      }).then(
        function(data) {
          callback(i, data);
        },
        function(err) {
          console.warn("_Widget._doGetWithClosure()", err);
          callback(i, null);
        }
      );
    },
    initLogger () {
      if (!this.$options.name) {
        console.warn('No name for widget', this)
      }
    },
    /**
     * Message sending stuff
     */
    showHint (msg) {
      this.$root.$emit('Hint', msg)
    },
    showError (msg) {
      this.$root.$emit('Error', msg)
    },
    showSuccess (msg) {
      this.$root.$emit('Success', msg)
    },
    /**
     * Helper
     */
		stripHTML:function(s){
			if(!s)
				s="";
			s = s.replace(/<\/?[^>]+(>|$)/g, "");
			s = s.replace(/%/g, "$perc;");
			return s;
		},

		unStripHTML:function(s) {
			if(!s){
				s="";
			}
			s = s.replace(/\$perc;/g, "%");
			return s;
		},

		setInnerHTML:function(e, txt){
			if(e){
				txt =  this.stripHTML(txt);
				txt =txt.replace(/\n/g, "<br>");
				txt =txt.replace(/\$perc;/g, "%");
				e.innerHTML = txt;
			} else {
				console.warn("setInnerHTML() > No node to set test > ", txt);
			}
    },

    setTextContent (e, txt) {
	    if(e){
				txt =  this.stripHTML(txt);
				txt =txt.replace(/\n/g, "<br>");
				txt =txt.replace(/\$perc;/g, "%");
				e.textContent = txt;
			} else {
				console.warn("setTextContent() > No node to set test > ", txt);
			}
    },

		_getStatus:function(key){
		  if (typeof(Storage) !== "undefined") {
        let value = localStorage.getItem(key);
        if (value) {
          return JSON.parse(value)
        }
      }
		},

		_setStatus (key, value){
      if (typeof(Storage) !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },
    _getMousePosition (e){
      // updated and synced with simulator
      // in case of error roll back and change mixin order in simulator
      let result = {x: 0, y: 0};
      if (e) {
		    if (e.touches && e.touches.length > 0) {
          e = e.touches[0]
          result.x = e.clientX;
          result.y = e.clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0 ) {
          e = e.changedTouches[0]
          result.x = e.clientX;
          result.y = e.clientY;
        } else {
          result.x = e.pageX;
          result.y = e.pageY;
        }
      }
      return result;
    },
    destroy () {
      this._dojoCleanUpOwn();
      this._dojoCleanUpEvent();
      this.cleanUpTempListener();
      registry.remove(this)
    },

    /**
     * Init here the arrays to hold the listeners
     * We have to make sure we call this onlz once, because
     * otherwise mixins might reset existing listeners
     */
    initDojoListeners () {
      if (!this._dojoListener){
        //console.debug('DojoWidget.initDojoListeners() > enter', this.name)
        this._dojoListener = [];
        this._dojoWidgetEventListener = {};
        this._dojoWidgetEventListenerCounter = 0
        this._xhrGetCache = {};
        this._dojoTempListener = []
      }
    }
  },

  beforeDestroy() {
    this.destroy()
    this._dojoCleanUpOwn();
    this._dojoCleanUpEvent();
    this.cleanUpTempListener();
    registry.remove(this)
  },
  mounted() {
    this.initDojoListeners();
    this.initLogger()
    this.initDomNodes();
    /**
     * Simulate dojo life cycle. This can cause some issues,
     * if the mixin order is not correct!
     */
    if (!this.dojoInited) {
      registry.add(this)
      this.startup();
      this.postCreate();
      this.dojoInited = true
    }
  }
};
</script>
