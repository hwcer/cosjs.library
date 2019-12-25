"use strict";
const cosjs_promise = require('./promise');
//Deprecated
//同步/异步 执行多任务
function multi(handle,worker){
    if (!(this instanceof multi)) {
        return new multi(handle,worker)
    }
    this.handle = handle;             //待执行队列
    this.worker = worker;             //具体处理队列的方法
    this.interval = 0;                //延时
    this.breakOnError = false;       //队列出现错误时是否立即退出循环

    this._maxNum   = 0;
    this._curNum   = 0;
    this._errList  = [];
    this._promise_callback = null;

}
module.exports = multi;

//顺序执行
multi.prototype.start = function(){
    if(Array.isArray(this.handle)){
        this._maxNum = this.handle.length;
    }
    else if(typeof this.handle =='object'){
        this.handle = Object.keys(this.handle);
        this._maxNum = this.handle.length;
    }
    else{
        this._maxNum = parseInt(this.handle);
        this.handle  = null;
    }
    if(this._maxNum<1){
        return Promise.resolve(0);
    }

    return new Promise((resolve,reject)=>{
        set_this_promise_callback.call(this,resolve,reject);
        asyn_start.call(this);
    })
}

function set_this_promise_callback(resolve,reject){
    this._promise_callback = ()=>{
        let errNum = this._errList.length;
        if(errNum > 0){
            reject(this._errList[0]);
        }
        else {
            resolve(0);
        }
    }
}


function asyn_start(){
    let args = this.handle ? this.handle[this._curNum] : this._curNum;
    Promise.resolve(1).then(()=>{
        return this.worker(args);
    }).then(ret=>{
        asyn_result.call(this,null,ret);
    }).catch(err=>{
        asyn_result.call(this,err);
    })
}

function asyn_result(err,ret){
    this._curNum ++;
    if(err){
        this._errList.push(cosjs_promise.error(err,ret));
    }
    if( err && this.breakOnError){
        return this._promise_callback();
    }

    if(this._curNum >= this._maxNum){
        return this._promise_callback();
    }
    setTimeout(asyn_start.bind(this),this.interval);
}