/**
 * author:周连毅
 * 说明：获取 地域分析-当前全国安全域开通总数
 */
/*使用deferred机制导出*/
var FORMAT = oplateConsts.DATE_TIME_FORMAT;
exports.getRealmZoneAnalysisData = function(startTime,endTime) {
    var Deferred = $.Deferred();
    var start_time = startTime ? moment(new Date(+startTime)).format(FORMAT) : '';
    var end_time = endTime ? moment(new Date(+endTime)).format(FORMAT) : '';
    $.ajax({
        url: '/rest/analysis/realm-zone',
        dataType: 'json',
        type: 'get',
        data: {
            starttime: start_time,
            endtime: end_time
        },
        success: function(list,text,xhr) {
            var noRealm = xhr.getResponseHeader('norealm');
            Deferred.resolve(list , !!noRealm);
        }
    });
    return Deferred.promise();
};