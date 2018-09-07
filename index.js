"use strict";
const loader = require('cosjs.loader')(__dirname + '/lib');

function library(name){
    let fun = loader.parse(name);
    if(!fun){
        throw new Error(`library[${name}] not exist`);
    }
    if(typeof fun === 'function'){
        return fun.apply(this,Array.prototype.slice.call(arguments,1) );
    }
    else{
        return fun;
    }
}


module.exports = library

module.exports.loader = loader;

module.exports.require = loader.require.bind(loader)

module.exports.namespace = function(name){
    if(!name){
        throw new Error("namespace name empty");
    }
    if(module.exports[name]){
        return;
    }
    module.exports[name] = function(){
        arguments[0] = [name,arguments].join('/')
        return library.apply(this,arguments);
    }
}


if (!Object.values) {
    Object.values = function(obj) {
        if (obj !== Object(obj))
            throw new TypeError('Object.values called on a non-object');
        var val=[],key;
        for (key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj,key)) {
                val.push(obj[key]);
            }
        }
        return val;
    }
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
                    target[ name ] = Object.extend( deep, clone, copy );

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
