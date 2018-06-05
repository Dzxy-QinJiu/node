/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/6.
 */
//左侧周报题目列表滚动条参数
exports.REPORT_TITLE_LIST_LAYOUT_CONSTANTS = {
    TOP_DELTA: 60,
    BOTTOM_DELTA: 39
};
//请假类型
exports.LEALVE_OPTION = [
    {
        value: 'leave',
        label: Intl.get('weekly.report.ask.for.leave','请假')
    },
    {
        value: 'business',
        label: Intl.get('weekly.report.business.trip','出差')
    },
    {
        value: 'other',
        label: Intl.get('crm.186', '其他')
    },
];
//请假时间
exports.LEALVE_DURATION_OPTION = [
    {
        value: '1',
        label: Intl.get('weekly.report.n.days','{n}天',{n: 1})
    },
    {
        value: '0.5',
        label: Intl.get('weekly.report.n.days','{n}天',{n: 0.5})
    },
];

