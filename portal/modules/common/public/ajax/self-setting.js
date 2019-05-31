/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/23.
 */
var trans = $.ajaxTrans();
trans.register('approveSelfSettingApply', {url: '/rest/approve/self_setting/apply', type: 'post'});

exports.approveSelfSettingApply = function(reqParams) {
    return trans.getAjax('approveSelfSettingApply', reqParams);
};
