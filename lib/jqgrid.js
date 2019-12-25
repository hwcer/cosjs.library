//JQGRID服务器端接口

const formatter = require('./format').parse;

//type :add ?edit
exports.value = function(body,format,type){
    let info = {};
    if(!format){
        throw new Error(`format not exist`);
    }

    for (let k in format) {
        if(format[k][type]){
            info[k] = formatter(body[k], format[k]['type']) ;
        }
        if( format[k][type] > 1 && !info[k] ){
            let name = format[k]['name'] || k;
            throw new Error(`${name}不能为空`);
        }
    }
    return info;
}

exports.query = function(body){
    let query = {},format = arguments[1]||{};
    let filters = this.get('filters','json');

    if(!filters) {
        let searchField = body['searchField'];
        if (searchField) {
            if (!format[searchField]) {
                query[searchField] = body['searchString'];
            }
            else{
                let searchType = realType(format[searchField]['type']);
                let searchValue = formatter(body['searchString'], searchType);
                query[searchField] = searchValue;
            }
            
        }
    }else{
        let rules = filters['rules'];
        if(!filters['groupOp'] || !rules || rules.length < 1 ){
            return query;
        }

        let op = ['$',filters['groupOp'].toLowerCase() ].join('');
        let sarr = [];
        for(let v of rules){
            let field = v['field'];
            if ( !format[field]) {
                sarr.push(monogFilters(field,v['data'],v['op']));
            }
            else{
                let type = realType(format[field]['type']);
                let value = formatter(v['data'],type);
                sarr.push(monogFilters(field,value,v['op']));
            }
        }
        if(arguments[2]){
            for(let s of sarr){
                Object.assign(query,s);
            }
        }
        else if(sarr.length > 1 ){
            query[op] = sarr;
        }
        else if(sarr.length == 1 ){
            query = sarr[0];
        }
    }
    return query;
}


function realType(type){
    if(type.indexOf(".")>0){
        let arrType = type.split(".");
        return arrType.pop();
    }
    else {
        return type;
    }
}


function monogFilters(k,v,op) {
    var data = {};
    switch (op){
        case 'eq':
            data[k] = v;
            break;
        case 'ne':
            data[k] = {"$ne":v};
            break;
        case 'lt':
            data[k] = {"$lt":v};
            break;
        case 'le':
            data[k] = {"$lte":v};
            break;
        case 'gt':
            data[k] = {"$gt":v};
            break;
        case 'ge':
            data[k] = {"$gte":v};
            break;
        case 'cn':
            data[k] = v;
            break;
    }

    return data;
}