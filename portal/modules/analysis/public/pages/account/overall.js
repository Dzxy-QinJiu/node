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
        accountChart.getAccountNumChart('total', '总体账号数统计'),
        //总帐号来源分类统计
        accountChart.getAccountSourceChart('total', '总帐号来源分类统计'),
        //有效账号数统计
        accountChart.getAccountValidChart(),
        //总帐号地域统计
        accountChart.getAccountZoneChart('total', '总帐号地域统计'),
        //总帐号行业统计
        accountChart.getAccountIndustryChart('total', '总帐号行业统计'),
        //总帐号团队统计
        accountChart.getAccountTeamChart('total', '总帐号团队统计'),
        //单应用帐号类型统计
        accountChart.getAccountTypeChart(),
        //单应用帐号状态统计
        accountChart.getAccountStatusChart(),
        //单应用帐号活跃度趋势
        accountChart.getActivityChart(),
        //活跃时间段
        accountChart.getActiveTimeIntervalChart(),
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
        //销售开通账号统计
        accountChart.getAccountSalesOpenAccountChart(),
    ];
}
