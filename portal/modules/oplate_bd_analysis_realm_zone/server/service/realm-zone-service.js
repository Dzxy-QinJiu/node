/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前区域安全域分析 的service文件
 */
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);

//定义url
var urls = {
    //获取安全域数据
    getRealmZone : "/rest/analysis/realm/v1/realm_zone"
};
//导出url
exports.urls = urls;
//获取安全域数据
exports.getRealmZoneAnalysisData = function (req, res, startTime, endTime) {
    return restUtil.authRest.get(
        {
            url: urls.getRealmZone,
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