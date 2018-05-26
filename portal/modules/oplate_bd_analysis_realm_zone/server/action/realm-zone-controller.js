/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前区域安全域分析 的action文件
 */
/**
 * 统计分析-地域分析-获取当前全国安全域开通总数
 * @param req
 * @param res
 */
var RealmZoneService = require("../service/realm-zone-service");
exports.getRealmZoneAnalysisData = function(req,res) {
    var startTime = req.query.starttime;
    var endTime = req.query.endtime;
    RealmZoneService.getRealmZoneAnalysisData(req,res,startTime,endTime).on("success", function(data) {
        if(!data.hasRealm) {
            res.set('norealm' , true);
        }
        res.json(data.list);
    }).on("error", function(data) {
        res.json(data);
    });
};