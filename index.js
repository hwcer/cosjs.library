"use strict";
const cosjs_loader = require('cosjs.loader');

module.exports = cosjs_loader.package(__dirname + '/lib');

console.debug = require('./lib/debug');

if (!Object.values) {
    Object.values = function(obj) {
        if (obj !== Object(obj))
            throw new TypeError('Object.values called on a non-object');
        let val=[],key;
        for (key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj,key)) {
                val.push(obj[key]);
            }
        }
        return val;
    }
}

if (!Object.from) {
    Object.from = function(obj) {
        let arr,ret = {};
        if(!obj || typeof obj !== 'object'){
            return ret;
        }
        if(Array.isArray(arguments[1])){
            arr = arguments[1];
        }
        else {
            arr = Array.from(arguments);
            arr.shift();
        }
        for(let k of arr){
            ret[k] = obj[k];
        }
        return ret;
    }
}
//Math.roll(1,100);
if (!Math.roll) {
    Math.roll = function () {
        let min,max;
        if (arguments.length > 1) {
            min = arguments[0];max = arguments[1];
        }
        else {
            min = 1;max = arguments[0];
        }
        if (min >= max) {
            return max;
        }
        let key = max - min + 1;
        let val = min + Math.floor(Math.random() * key);
        return val;
    }
}

if (!Array.random) {
    Array.random = function (arr) {
        let i = Math.roll(0,arr.length -1);
        return arr[i]||null;
    }
}

Map.prototype.toJSON = function(){
    let J = {};
    for(let [k,v] of  this){
        J[k] = v;
    }
    return J;
}

Set.prototype.toJSON = function(){
    return Array.from(this);
}

JSON.tryParse = function json_parse(text,reviver){
    if( !text || typeof text == 'object'){
        return text;
    }
    let json = null;
    try {
        json = JSON.parse(text,reviver);
    }
    catch(e){
        json = null;
    }
    return json;
}

JSON.clone = function json_clone(v){
    return JSON.parse(JSON.stringify(v));
}

//对象合并
JSON.extend = function json_extend() {
        let target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;
        // skip the boolean and the target
        target = arguments[ i ] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && typeof target != 'function' ) {
        target = {};
    }

    for ( ; i < length; i++ ) {
        let options;
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( let name in options ) {
                let src = target[ name ];
                let copy = options[ name ];
                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if ( deep && copy && typeof copy == 'object' ) {
                    let clone;
                    if ( Array.isArray(copy)  ) {
                        clone = src && Array.isArray(src) ? src : [];

                    } else {
                        clone = src && typeof src === 'object' ? src : {};
                    }

                    // Never move original objects, clone them
                    target[ name ] = JSON.extend( deep, clone, copy );

                    // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }
    // Return the modified object
    return target;
}
