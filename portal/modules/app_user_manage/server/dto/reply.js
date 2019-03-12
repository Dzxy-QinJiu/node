/**
 * 转换成前端使用的对象
 */
var _ = require('lodash');
var moment = require('moment');
exports.toRestObject = function(list) {
    var result = [];
    list = list || [];
    if(!_.isArray(list)) {
        list = [];
    }
    list.forEach(function(item) {
        var dateText = moment(new Date(+item.comment_time)).format(global.oplateConsts.DATE_TIME_FORMAT);
        if(dateText === 'Invalid date') {
            dateText = '';
        }
        result.push({
            user_id: item.user_id,
            user_name: item.nick_name,
            nick_name: item.nick_name,
            message: item.comment,
            date: dateText,
            approve_status: item.approve_status,
            comment_time: item.comment_time
        });
    });
    return _.sortBy( _.cloneDeep(result), [item => item.comment_time]);
};