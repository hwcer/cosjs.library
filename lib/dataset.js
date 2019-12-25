"use strict";

const bignumber = require('bignumber.js');
//使用“.”操作对象
// dataset.call({},key,val,MathType)
//MathType 0:set,1:add,-1:sub
//return MathType后的结果
//key,value,type

function dataset(data){
    if (!(this instanceof dataset)) {
        return new dataset(data)
    }
    Object.defineProperty(this,'_data_cache',{ enumerable: false, configurable: false, writable: false,  value: data||{} })
    this.has = function (key) {
        return this._data_cache.hasOwnProperty(key);
    }

    this.get = function (key) {
        if(!key){
            return this._data_cache;
        }
        else {
            return getter.call(this,this._data_cache,key);
        }
    }
    //key,val
    this.set = function(){
        Array.prototype.unshift.call(arguments,'set');
        return verify.apply(this,arguments);
    }
    this.add = function(){
        Array.prototype.unshift.call(arguments,'add');
        return verify.apply(this,arguments);
    }
    this.sub = function(){
        Array.prototype.unshift.call(arguments,'sub');
        return verify.apply(this,arguments);
    }
    this.del = function(){
        Array.prototype.unshift.call(arguments,'del');
        return verify.apply(this,arguments);
    }

    this.push = function(){
        Array.prototype.unshift.call(arguments,'push');
        return verify.apply(this,arguments);
    }
    //合并对象
    this.assign = function(){
        Array.prototype.unshift.call(arguments,'assign');
        return verify.apply(this,arguments);
    }

    this.toJSON = function () {
        return this._data_cache;
    }
    this.toString = function () {
        return JSON.stringify(this._data_cache);
    }
}



module.exports = dataset;

//t,k,v
function verify(t,k) {
    if( isObject(k) && ['set','assign'].indexOf(t) >=0 ){
        Object.assign(this._data_cache,k);
        return this._data_cache;
    }
    else if(k){
        Array.prototype.unshift.call(arguments,this._data_cache);
        return setter(...arguments);
    }
}


function getter(data,key) {
    let arr  = Array.isArray(key) ? key : String(key).split(".");
    let k = arr.shift();
    if( !isObject(data) || !data.hasOwnProperty(k) ){
        return null;
    }
    if(arr.length > 0){
        return getter.call(this,data[k],arr);
    }
    else {
        return data[k];
    }
}
//d,t,k,[v]
function setter(data,type,key) {
    if( !isObject(data) ){
        return false;
    }
    let arr  = Array.isArray(key) ? key : String(key).split(".");
    let k = arr.shift();
    if(arr.length > 0){
        if(!data.hasOwnProperty(k)){
            data[k] = {};
        }
        else if(!isObject(data[k])){
            return false;
        }
        arguments[0] = data[k];
        arguments[2] = arr;
        return setter.apply(this,arguments);
    }
    else {
        arguments[2] = k;
        return update.apply(this,arguments);
    }

}

function isObject(o) {
    return (o && typeof o === 'object' && !Array.isArray(o))
}


//args:  data,key,val,type
//type:  -1:sub,0;set,1:add
function update(data,type,key){
    let d,v;
    switch (type) {
        case 'del':
            delete data[key];
            break;
        case 'add':
            d = data[key] || 0;v=Number(arguments[3]);
            data[key] = math_add(d,v);
            break;
        case 'sub':
            d = data[key] || 0;v=Number(arguments[3]);
            data[key] = math_sub(d,v);
            break;
        case 'set':
            data[key] = arguments[3];
            break;
        case 'push':
            if(Array.isArray(data[key])){
                data[key].push(arguments[3]);
            }
            break;
        case 'assign':
            Object.assign(data[key] , arguments[3])
            break;
    }

    return data[key];
}



//求和
function math_add(num1,num2){
    let bn = new bignumber(num1);
    return bn.plus(num2).toNumber()
}


//相减
function math_sub(num1,num2){
    let bn = new bignumber(num1);
    return bn.minus(num2).toNumber();
}