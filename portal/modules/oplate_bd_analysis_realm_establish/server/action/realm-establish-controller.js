/**
 * author:周连毅
 * 说明：统计分析-当前安全域-开通个数统计 action文件
 */
var RealmEstablishService = require("../service/realm-establish-service");
/**
 * 开启个数统计
 * @param req
 * @param res
 */
exports.getRealmEstablishData = function(req,res) {
    var startTime = req.query.starttime;
    var endTime = req.query.endtime;
    var unit = req.query.unit;
    RealmEstablishService.getRealmEstablishAnalysisData(req , res , startTime , endTime , unit).on("success" , function(data) {
        if(!data.hasRealm) {
            res.set('norealm' , true);
        }
        res.json(data.list);
    }).on("error" , function(data) {
        res.json(data);
    });
};