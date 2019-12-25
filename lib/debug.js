"use strict";
const timeFormat = require('./time').format;
module.exports = function(){
    let debug = process.env.NODE_ENV === "production" ? 0 :1;
    if(!debug){
        return false;
    }
    let arr = Array.from(arguments);
    arr.unshift(timeFormat("yyyy-MM-dd hh:mm:ss"));
    for(let i=0;i<arr.length;i++){
        if(arr[i] instanceof Error){
            arr[i] = arr[i].stack
        }
        else if(typeof arr[i] === 'object'){
            arr[i] = JSON.stringify(arr[i])
        }
    }
    console.log.apply(console,arr);
    return false;
}