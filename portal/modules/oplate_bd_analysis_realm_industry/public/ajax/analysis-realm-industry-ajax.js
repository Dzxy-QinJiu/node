/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前安全域行业分析 的ajax定义
 */
//获取 行业分析-当前行业安全域开通总数
var FORMAT = oplateConsts.DATE_TIME_FORMAT;
exports.getRealmIndustryAnalysisData = function(startTime,endTime) {
    //使用deferred创建promise
    var Deferred = $.Deferred();
    var start_time = startTime ? moment(new Date(+startTime)).format(FORMAT) : '';
    var end_time = endTime ? moment(new Date(+endTime)).format(FORMAT) : '';
    //使用jquery做ajax
    $.ajax({
        //ajax 的地址
        url: '/rest/analysis/realm-industry',
        //返回json格式数据
        dataType: 'json',
        //事情方式为get
        type: 'get',
        //请求数据
        data: {
            starttime: start_time,
            endtime: end_time
        },
        //请求成功的回调函数
        success: function(list,text,xhr) {
            var noIndustry = xhr.getResponseHeader('norealm');
            Deferred.resolve(list , !!noIndustry);
        }
    });
    //返回promise对象
    return Deferred.promise();
};