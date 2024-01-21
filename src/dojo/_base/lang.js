class lang {

    listGroupBy (list, key) {
        const result = {}
        list.forEach(element => {
            const value = element[key]
            if (!result[value]) {
                result[value] = []
            }
            result[value].push(element)
        });
        return result
    }

    stopEvent(e) {        
        if (e && e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }    
    }

    hitch (scope, method){
        if(arguments.length > 2){
            return this._hitchArgs.apply(scope, arguments); // Function
        }
        if(!method){
            method = scope;
            scope = null;
        }
        if(this.isString(method)){
            if(!scope[method]){ throw(['lang.hitch: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
            return function(){ return scope[method].apply(scope, arguments || []); }; // Function
        }
        return !scope ? method : function(){ return method.apply(scope, arguments || []); }; // Function
    }

    _hitchArgs (scope, method1){
        var pre = _toArray(arguments, 2);
        var named = isString(method1);
        return function(){
            var args = _toArray(arguments);
            var f = named ? (scope)[method1] : method1;
            return f && f.apply(scope || this, pre.concat(args));
        };
    }

    isString (it) {
        return (typeof it == "string" || it instanceof String); // Boolean
    }

    isArray (it) {
        return it && (it instanceof Array); // Boolean
    }

    isObject (it) {
        return it !== undefined &&
            (it === null || typeof it == "object" || Array.isArray(it)); // Boolean
    }

    clone (obj) {
        if (!obj) {
            return null
        }
        let _s = JSON.stringify(obj)
        return JSON.parse(_s)
    }


    _mixin (dest, source, copyFunc){
        var name, s, empty = {};
        for(name in source){
            s = source[name];
            if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
                dest[name] = copyFunc ? copyFunc(s) : s;
            }
        }
        return dest; // Object
    }

    mixin (dest){
        if(!dest){ dest = {}; }
        for(var i = 1, l = arguments.length; i < l; i++){
            this._mixin(dest, arguments[i]);
        }
        return dest; // Object
    }
}

function _toArray (obj, offset) {
    //return (startWith||[]).concat(Array.prototype.slice.call(obj, offset||0));
    var arr = [];
    for(var x = offset || 0; x < obj.length; x++){
        arr.push(obj[x]);
    }
    return arr;
}

function isString (it) {
    // summary:
    //		Return true if it is a String
    // it: anything
    //		Item to test.
    return (typeof it == "string" || it instanceof String); // Boolean
}
export default new lang()