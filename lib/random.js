"use strict";
//ROLL点
exports.Roll = function(){
    return Math.roll.apply(Math,arguments);
}

//独立概率,默认单位:万
exports.Probability=function(Per,unit){
    unit = unit || 10000;
    if(Per>=unit){
        return true;
    }
    else if(Per <= 0){
        return false;
    }
    let rnd = Math.roll(1,unit);
    return Per >= rnd;
}

//相对概率（比重）；
exports.Relative = function (items){
    let next = 1,key='val',filter;
    if( arguments[next] && typeof arguments[next] !=="function"){
        key = arguments[next];
        next ++;
    }
    if(typeof arguments[next] ==="function"){
        filter = arguments[next];
    }

    if(!items || typeof items !== 'object'){
        return false;
    }
    let total = 0,per={};

    for (let k in items) {
        let item = items[k];
        if (filter && !filter(item)) {
            continue;
        }
        let val = typeof item == 'object' ?  item[key] : parseInt(item);
        if(val >0){
            per[k] = val;
            total += val;
        }
    }

    if(!total){
        return false;
    }

    let rnd = Math.roll(1,Math.floor(total));
    for(let k in per){
        rnd -=  per[k];
        if(rnd <=0){
            return k;
        }
    }
    return false;
}