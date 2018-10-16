/**
 * 过期账号分析
 */

import accountChart from '../../charts/account';

module.exports = {
    title: '过期账号分析',
    menuIndex: 3,
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
        accountChart.getZoneChart('expired'),
        //行业统计
        accountChart.getIndustryChart('expired'),
        //团队统计
        accountChart.getTeamChart('expired'),
        //登录统计
        accountChart.getOpenAccountChart('expired'),
    ];
}
