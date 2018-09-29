/**
 * 总体分析
 */

import accountChart from '../../charts/account';

module.exports = {
    title: '总体分析',
    menuIndex: 1,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //用户统计
        accountChart.getUserChart(),
        //地域统计
        accountChart.getZoneChart(),
        //行业统计
        accountChart.getIndustryChart(),
        //团队统计
        accountChart.getTeamChart(),
    ];
}
