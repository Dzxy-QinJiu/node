/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/9/19.
 */
var trans = $.ajaxTrans();
trans.register('getUserScoreIndicator', {url: '/rest/user/score/indicator', type: 'get'});
trans.register('getUserEngagementRule', {url: '/rest/get/user/engagement/rule', type: 'get'});
trans.register('getUserScoreLists', {url: '/rest/get/user/score/rules', type: 'get'});
exports.getUserScoreIndicatorAjax = function() {
    return trans.getAjax('getUserScoreIndicator');
};
exports.getUserEngagementRuleAjax = function() {
    return trans.getAjax('getUserEngagementRule');
};
exports.getUserScoreListsAjax = function() {
    return trans.getAjax('getUserScoreLists');
};