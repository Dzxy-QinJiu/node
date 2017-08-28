/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/7/27.
 */
//对坐席号的校验
exports.checkPhoneOrder = function (rule, value, callback) {
    value = $.trim(value);
    if (value) {
        if (/^\d{0,6}$/.test(value)) {
            callback();
        } else {
            callback(new Error(Intl.get("user.manage.phone.order.rule","请输入7位以内的数字")));
        }
    } else {
        callback();
    }
};