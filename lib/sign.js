"use strict";
const crypto = require('crypto');
//签名与验证
exports.create = function local_sign(data,secret){
    if(!data["_verify_time"]){
        data["_verify_time"] = Date.now();
    }
    data["_verify_sign"] = createSign(data,secret);
}

exports.verify = function local_verify(){
    let body,secret;
    if(arguments.length >1){
        body = arguments[0];secret=arguments[1]
    }
    else {
        body = this.req.body;secret=arguments[0]
    }

    if(!body || typeof body !== "object"){
        return "verify_body_error";
    }
    let _verify_sign = body["_verify_sign"];
    if( !_verify_sign ){
        return "verify_sign_empty";
    }
    //SIGN验证
    delete body["_verify_sign"];
    let server_sign = createSign(body,secret);
    if(_verify_sign !== server_sign){
        return "verify_sign_error";
    }
    return null;
}


//签名
function createSign(args,secret) {
    let arr = [];
    let keys = Object.keys(args).sort();
    for(let k of keys){
        let v = formatSignValue(args[k]);
        arr.push( k+"="+v);
    }
    arr.push(secret);
    return md5(arr.join('&'));
}

function formatSignValue(v){
    let ret;
    if(Array.isArray(v)){
        ret = v.join(",");
    }
    else if(typeof v === "object"){
        ret = JSON.stringify(v);
    }
    else {
        ret = v;
    }
    return encodeURIComponent(ret);
}

function md5(str){
    let _encrymd5 = crypto.createHash('md5');
    _encrymd5.update(str.toString(),'utf8');
    return _encrymd5.digest('hex');
}