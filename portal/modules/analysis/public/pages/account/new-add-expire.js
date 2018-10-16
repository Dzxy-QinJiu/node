/**
 * 新增过期账号分析
 */

import accountChart from '../../charts/account';

module.exports = {
    title: '新增过期账号分析',
    menuIndex: 4,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //用户类型
        accountChart.getTypeChart(),
        //地域统计
        accountChart.getZoneChart('added_expired'),
        //行业统计
        accountChart.getIndustryChart('added_expired'),
        //登录统计
        accountChart.getOpenAccountChart('added_expired'),
    ];
}
