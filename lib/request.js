"use strict";
const request = require('request');
const promise = require('./promise');
const querystring = require('querystring');
//json:返回结果是否按JSON格式处理
function promise_request(option,json){
    return new Promise((resolve,reject)=>{
        request(option,(err, res, body)=>{
            if(err){
                return reject(body || err.toString());
            }
            if(res.statusCode !== 200 && !body){
                return reject(promise.error('statusCode',res.statusCode));
            }
            if(!json){
                return resolve(body);
            }
            let data = typeof body === 'object'?body:JSON.tryParse(body);
            if(!data){
                return reject(promise.error('json_parse_error',body));
            }
            else{
                return resolve(data);
            }
        })
    })
}

module.exports = promise_request;



module.exports.get = function(url,data){
    let qurl,query = querystring.stringify(data);
    if(url.indexOf("?") >=0){
        qurl = url+ '&' + query;
    }
    else {
        qurl = url+ '?' + query;
    }
    let option = { url: qurl, method: "GET","json":true};
    if(arguments[3] && typeof arguments[3] === 'object'){
        option['headers'] = arguments[3];
    }
    return promise_request(option,arguments[2]);
}


module.exports.post = function(url,data){
    let option = { url: url, method: "POST","json":true,"body":data};
    if(arguments[3] && typeof arguments[3] === 'object'){
        option['headers'] = arguments[3];
    }
    return promise_request(option,arguments[2]);
}


//Content-Type:application/x-www-form-urlencoded
module.exports.form = function(url,data){
    let option = { url: url, method: "POST","form":data};
    return promise_request(option,arguments[2]);
}