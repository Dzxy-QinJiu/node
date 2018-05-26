/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前安全域行业分析 的service文件
 */
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);

//定义url
var urls = {
    //获取安全域行业数据
    getRealmIndustry : "/rest/analysis/realm/v1/realm_industry"
};
//导出url
exports.urls = urls;
//获取安全域数据
exports.getRealmIndustryAnalysisData = function(req, res, startTime, endTime) {
    return restUtil.authRest.get(
        {
            url: urls.getRealmIndustry,
            req: req,
            res: res
        }, {
            starttime : startTime,
            endtime : endTime
        }, {
            success : function(emitter, data, restResp) {
            //转换数据，计算是否一个安全域也没有
                var ret = {
                    hasRealm : true,
                    list : data
                };

                if(restResp.headers.norealm) {
                    ret.hasRealm = false;
                }

                emitter.emit("success" , ret);
            }
        });
};