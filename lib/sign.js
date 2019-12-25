"use strict";
const crypto = require('crypto');
const promise = require('./promise');

//签名
exports.create = function(data,secret){
    if(!data["_verify_time"]){
        data["_verify_time"] = Date.now();
    }
    data["_verify_sign"] = createSignString(data,secret);
    return data;
}
//验证
exports.verify = function(body,secret,expire){
    if(!body || typeof body !== "object"){
        return promise.error("verify_body_error",JSON.stringify(body));
    }
    let _verify_sign = body["_verify_sign"];
    if( !_verify_sign ){
        return promise.error("verify_sign_empty",JSON.stringify(body));
    }
    //SIGN验证
    delete body["_verify_sign"];
    let server_sign = createSignString(body,secret);
    if(_verify_sign !== server_sign){
        return promise.error("verify_sign_error",server_sign);
    }
    //时间验证
    if(expire){
        let time = Date.now();
        let usems = time - body["_verify_time"];
        if(usems <=0 || usems > expire){
            return promise.error('verify_time_expire',usems);
        }
    }
    delete body["_verify_time"];

    return promise.error(null);
}

//签名
function createSignString(args,secret) {
    let arr = [];
    let keys = Object.keys(args).sort();
    for(let k of keys){
        let v = formatSignValue(args[k]);
        if(v){
            arr.push( k+"="+encodeURIComponent(v));
        }
    }
    arr.push(secret);
    return md5(arr.join('&'));
}
// array,object全部转换成JSON字符串,number转字符类型;null,undefined,空字符串,不参与签名
function formatSignValue(v){
    if(v && typeof v === "object"){
        return JSON.stringify(v);
    }
    else if(typeof v === 'number'){
        return String(v);
    }
    else {
        return v;
    }
}

function md5(str){
    let _encrymd5 = crypto.createHash('md5');
    _encrymd5.update(str.toString(),'utf8');
    return _encrymd5.digest('hex');
}

/*
let a;
let r = {a:a,b:null,c:0,d:'test',x:[],y:{}} ;
console.log(createSignString(r,123456) )
//str: c=0&d=test&x=%5B%5D&y=%7B%7D&123456
 */
