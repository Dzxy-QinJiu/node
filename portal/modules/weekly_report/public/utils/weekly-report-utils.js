/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/6.
 */
//左侧周报题目列表滚动条参数
exports.REPORT_TITLE_LIST_LAYOUT_CONSTANTS = {
    TOP_DELTA: 90,
    BOTTOM_DELTA: 39
};
//计算今天是今年的第几周
exports.getNWeekOfYear = function (nDate) {
    var firstDay = new Date(nDate.getFullYear(), 0, 1);
    var dayOfWeek = firstDay.getDay();
    var spendDay = 1;
    if (dayOfWeek !== 0) {
        spendDay = 7 - dayOfWeek + 1;
    }
    firstDay = new Date(nDate.getFullYear(), 0, 1 + spendDay);
    var d = Math.ceil((nDate.valueOf() - firstDay.valueOf()) / 86400000);
    var result = Math.ceil(d / 7);
    return result + 1;
};