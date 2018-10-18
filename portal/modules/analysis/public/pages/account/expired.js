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
        //过期账号数统计
        accountChart.getAccountNumChart('expired', '过期账号数统计'),
        //行业统计
        accountChart.getAccountIndustryChart('expired', '过期账号行业统计'),
        //团队统计
        accountChart.getAccountTeamChart('expired', '过期帐号团队分布统计'),
        //账号类型
        accountChart.getAccountTypeChart('expired'),
        //状态统计
        accountChart.getAccountStatusChart('expired'),
        //单应用帐号活跃度趋势
        accountChart.getActivityChart(),
        //在线时长统计
        accountChart.getLoginLongChart(),
        //设备统计
        accountChart.getAccountDeviceChart(),
        //浏览器统计
        accountChart.getAccountBrowserChart(),
        //用户访问次数
        accountChart.getLoginCountsChart(),
        //活跃用户地域统计
        accountChart.getActiveAreaChart(),
        //用户访问天数
        accountChart.getLoginDaysChart(),
        //用户在线时间
        accountChart.getLoginTimesChart(),
        //平均在线时长
        accountChart.getAverageOnlineTimeChart(),
    ];
}
