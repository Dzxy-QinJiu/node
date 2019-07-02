var mapService = require('../service/map');
//获取查询所有行政区域规划信息
exports.getAreaInfo = function(req, res) {
    mapService.getAreaInfo(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};