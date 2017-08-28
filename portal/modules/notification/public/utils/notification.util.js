var FORMAT = oplateConsts.DATE_TIME_FORMAT;
//格式化时间
exports.formatTime = function(longTimeMillis) {
    var date = new Date(+longTimeMillis);
    var dateStr = moment(date).format(FORMAT);
    if(dateStr === 'Invalid date') {
        dateStr = '';
    }
    return dateStr;
};