"use strict";
const util = require('util');
const cosjs_timeout = util.promisify(setTimeout);

//
// const makeExecuteCallback = (resolve, reject) =>function executeCallback(err, ret) { if(err){  reject(promise_error(err,ret)) } else {  resolve(ret);  }  };


function promise(name,...args) {
    let fun;
    if(typeof name === 'function'){
        fun = name;
    }
    else if(this && typeof this[name] ==='function'){
        fun = this[name];
    }
    if(!fun ){
        throw new Error(`library.promise[${name}] not function`);
    }

    let promisify_fun = util.promisify(fun);
    return promisify_fun.apply(this,args);
    //
    // return new Promise((resolve,reject)=>{
    //     let handler = makeExecuteCallback(resolve,reject);
    //     args.push(handler);
    //     try {
    //         fun.apply(this,args);
    //     } catch (e) {
    //         handler(e);
    //     }
    // })
}

function promise_error(err,ret) {
    if (err && typeof err === 'object') {
        return err;
    }
    if (!(this instanceof promise_error)) {
        return new promise_error(err,ret);
    }
    this.err = err;
    this.ret = ret;
}




function promise_callback(){
    let err,ret;
    if(arguments[0] && typeof arguments[0] === 'object' && arguments[0].hasOwnProperty('err') ){
        err = arguments[0]['err'];ret = arguments[0]['ret']
    }
    else if(arguments.length > 2){
        ret = Array.from(arguments);
        err = ret.shift();
    }
    else{
        err = arguments[0];ret= arguments[1];
    }
    if(err){
        return Promise.reject(promise_error(err,ret));
    }
    else {
        return Promise.resolve(ret);
    }
}

function promise_timeout(ms,fun,...args){
    return cosjs_timeout(ms).then(()=>{
        if( fun && typeof fun ==='function'){
            return fun.apply(this,args);
        }
        else if( fun && this && typeof this[fun] ==='function'){
            return this[fun].apply(this,args);
        }
        else if(fun){
            throw new Error('promise timeout arg[fun] not function');
        }
    })
}
//使用callback或者Promise 调用一个Promise函数，方式取决于最后一个参数是不是function（callback）
function promise_transform(name,...args){
    let fun,callback;
    if(typeof name === 'function'){
        fun = name;
    }
    else if(this && typeof this[name] ==='function'){
        fun = this[name];
    }
    if(typeof args[args.length - 1] === 'function'){
        callback = args.pop();
    }
    else {
        callback = promise_callback;
    }
    if(!fun ){
        return callback(`library.promise[${name}] not function`);
    }
    return fun.apply(this,args).then(ret=>{
        return callback(null,ret);
    }).catch(err=>{
        return callback(err);
    })

}

module.exports = promise;
module.exports.error = promise_error;
module.exports.timeout = promise_timeout;
module.exports.callback = promise_callback;
module.exports.transform = promise_transform;