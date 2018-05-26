/**
 * author:周连毅
 * 说明：统计分析-当前安全域-开通个数统计 ajax定义
 */
//oplate统计分析-获取安全域开启时间统计
var FORMAT = oplateConsts.DATE_TIME_FORMAT;
exports.getRealmEstablishAnalysisData = function(startTime,endTime,unit) {
    //使用deferred机制
    var Deferred = $.Deferred();
    var start_time = startTime ? moment(new Date(+startTime)).format(FORMAT) : '';
    var end_time = endTime ? moment(new Date(+endTime)).format(FORMAT) : '';
    //使用jquery的ajax
    $.ajax({
        //定义路由
        url: '/rest/analysis/realm-establish',
        //返回json格式
        dataType: 'json',
        //请求方式为get
        type: 'get',
        //请求数据
        data: {
            starttime: start_time,
            endtime: end_time,
            unit: unit
        },
        //成功回调
        success: function(list,text,xhr) {
            var noEstablish = xhr.getResponseHeader("norealm");
            Deferred.resolve(list , !!noEstablish);
        },
        error: function() {
            Deferred.resolve([] , false);
        }
    });
    //返回promise对象
    return Deferred.promise();
};