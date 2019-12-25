"use strict";
const HOURTOTMS  = 3600 * 1000;
const DAYTOTALMS = 86400 * 1000;

//每日时间重置点
exports.reset = 0;

//本周开始时间
exports.week = function(){
    let today = exports.today();
    if(arguments[0]){
        today += (arguments[0] * 7 * DAYTOTALMS);
    }
    let nowDate = new Date(today);
    let nowWeek = nowDate.getDay() || 7;
    return today - (nowWeek - 1)* DAYTOTALMS;
}



//本日开始时间
exports.today = function(){
    let newDate,newTime = arguments[0] || Date.now();
    if(exports.reset > 0) {
        newTime = newTime - exports.reset * HOURTOTMS;
    }
    newDate = new Date(newTime);
    newDate.setHours(exports.reset,0,0,0);
    return newDate.getTime();
}



//有效天数,到结束日期的23:59:59:999
exports.expire = function(time,days){
    let newDate = typeof time === 'object' ? time : new Date(time);
    newDate.setHours(exports.reset,0,0,0);
    let newTime = newDate.getTime();
    return newTime + days * DAYTOTALMS - 1;
}

//每日时间标签
exports.sign = function(time,format){
    time = time || Date.now();
    format = format || 'yyyyMMdd';
    let DAYRESETMS = exports.reset * HOURTOTMS;
    let newDate = new Date( time- DAYRESETMS);
    return parseInt(exports.format(format,newDate));
}


exports.format = function(format,time){
    let date;
    if(!time){
        date = new Date();
    }
    else if(typeof time =='object'){
        date = time;
    }
    else{
        date = new Date(time);
    }
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        //"q+": Math.floor((date.getMonth() + 3) / 3), //季度
        //"S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return format;
}