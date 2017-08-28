const DATE_TIME_FORMAT = oplateConsts.DATE_TIME_FORMAT;
//获取日期时间字符串
exports.getDateTimeStr = function(millis) {
    return moment(new Date(+millis)).format(DATE_TIME_FORMAT);
};