/**
 * ajax url定义
 */
var urls = {
    getGuideConfig: '/rest/base/v1/user/member/guide',
    setGuideMark: '/rest/base/v1/user/member/guide/mark/:step',
    closeGuideMark: '/rest/base/v1/user/member/guide/close/:step',
    //获取推荐的线索
    getRecommendClueLists: '/rest/clue/v2/companys/search/drop_down_load',
    //批量提取线索
    batchExtractRecommendLists: '/rest/clue/v2/ent/clues',
};
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');

//获取我的引导
exports.getGuideConfig = function(req, res) {
    return restUtil.authRest.get({
        url: urls.getGuideConfig,
        req: req,
        res: res
    }, {});
};

//引导步骤标注
exports.setGuideMark = function(req, res) {
    let guide = req.params;
    return restUtil.authRest.post({
        url: urls.setGuideMark.replace(':step', guide.step),
        req: req,
        res: res
    }, null);
};

//引导步骤标注
exports.closeGuideMark = function(req, res) {
    let guide = req.params;
    return restUtil.authRest.post({
        url: urls.closeGuideMark.replace(':step', guide.step),
        req: req,
        res: res
    }, null);
};

// 获取推荐的线索
exports.getRecommendClueLists = function(req, res) {
    return restUtil.authRest.post({
        url: urls.getRecommendClueLists,
        req: req,
        res: res
    }, req.body);
};

// 批量提取推荐的线索
exports.batchExtractRecommendLists = function(req, res) {
    return restUtil.authRest.post({
        url: urls.batchExtractRecommendLists,
        req: req,
        res: res
    }, req.body);
};


