/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前安全域行业分析 的action文件
 */
var RealmIndustryService = require("../service/realm-industry-service");
/**
 * 行业分析-获取安全域行业分组数据
 * @param req
 * @param res
 */
exports.getRealmIndustryAnalysisData = function(req,res) {
    var startTime = req.query.starttime;
    var endTime = req.query.endtime;
    RealmIndustryService.getRealmIndustryAnalysisData(req , res , startTime , endTime).on("success" , function(data) {
        if(!data.hasRealm) {
            res.set('norealm' , true);
        }
        res.json(data.list);
    }).on("error" , function(data) {
        res.json(data);
    });
};