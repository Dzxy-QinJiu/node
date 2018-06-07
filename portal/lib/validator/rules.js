/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/6/15.
 */

import { removeCommaFromNum } from 'LIB_DIR/func';

//校验输入值加基础值是否大于最大值
//参数说明：
// max 最大值
// base 基础值
// msg 验证失败时的提示信息
// rule, value, callback 为回调参数，无需手工传人
export const numberAddNoMoreThan = function(max, base, msg, rule, value, callback) {
    value = removeCommaFromNum(value);

    value = parseFloat(value);
    base = parseFloat(base);
    max = parseFloat(max);

    if (isNaN(value) || isNaN(base) || isNaN(max)) {
        callback();
    } else {
        if (value + base > max) {
            callback(msg);
        } else {
            callback();
        }
    }
};

