var _ = require('underscore');
//对提供的数据，根据字段列表，进行转换
/**
 *
 * @param list      转换之前的数据
 * @param fields    需要的字段
 */
exports.transformFields = function(list , fields) {
    var isObject = !_.isArray(list);
    var enumerateFields = [];
    if(typeof fields === 'string' && fields) {
        enumerateFields = fields.split(',');
    }
    var enumerateList = isObject ? [list] : (_.isArray(list) ? list : []);
    var resultList = [];
    _.each(enumerateList , function(obj) {
        if(_.isEmpty(enumerateFields)) {
            resultList.push(obj);
        } else {
            var result = {};
            _.each(enumerateFields , function(prop) {
                result[prop] = obj[prop] || '';
            });
            resultList.push(result);
        }
    });
    return isObject ? resultList[0] : resultList;
};