/**
 * author:周连毅
 * 说明：统计分析-安全域分析-开通个数统计 的service文件
 */
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);

//定义url
var urls = {
    //获取安全域开通个数
    getRealmEstablish : "/rest/analysis/realm/v1/realm_establish"
};
//导出url
exports.urls = urls;
//获取安全域数据
exports.getRealmEstablishAnalysisData = function (req, res, startTime, endTime , unit) {
    return restUtil.authRest.get(
        {
            url: urls.getRealmEstablish,
            req: req,
            res: res
        }, {
            starttime : startTime,
            endtime : endTime,
            unit : unit
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