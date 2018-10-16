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
        //总体账号数统计
        accountChart.getUserNumChart('total', '总体账号数统计'),
        //总帐号地域统计
        accountChart.getUserZoneChart('total', '总帐号地域统计'),
        //总帐号行业统计
        accountChart.getUserIndustryChart('total', '总帐号行业统计'),
        //总帐号团队统计
        accountChart.getUserTeamChart('total', '总帐号团队统计'),
    ];
}
