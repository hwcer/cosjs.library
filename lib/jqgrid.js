//JQGRID服务器端接口
const library = require("library")
const formatter = library.require('format').parse;

//type :add ?edit
exports.value = function(fkey,type){
    var info = {},format = this.config.format(fkey);
    if(!format){
        throw new Error(`format ${fkey} not exist`);
    }

    for (var k in format) {
        if(format[k][type]){
            info[k] = this.get(k, format[k]['type']) ;
        }
        if( format[k][type] > 1 && !info[k] ){
            var name = format[k]['name'] || k;
            throw new Error(`${name}不能为空`);
        }
    }
    return info;
}

exports.query = function(key){
    var query = {};
    var format = this.config.format(key);
    if(!format){
        throw new Error(`format[${key}] not exist`);
    }
    var filters = this.get('filters','json');

    if(!filters) {
        var searchField = this.get('searchField');
        if (searchField) {
            if (!format[searchField]) {
                throw new Error(`searchField[${searchField}] not exist`);
            }
            var searchType = realType(format[searchField]['type']);
            var searchValue = this.get('searchString', searchType);
            query[searchField] = searchValue;
        }
    }else{
        var rules = filters['rules'];
        if(!filters['groupOp'] || !rules || rules.length < 1 ){
            return query;
        }

        var op = ['$',filters['groupOp'].toLowerCase() ].join('');
        var sarr = [];
        for(var v of rules){
            var field = v['field'];
            if ( v['data'] === "" || !format[field]) {
                continue;
            }
            //OP
            var type = realType(format[field]['type']);
            var value = formatter(v['data'],type);
            sarr.push(monogFilters(field,value,v['op']));
        }
        if(sarr.length > 1 ){
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
        var arrType = type.split(".");
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