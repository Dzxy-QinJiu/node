/**
 * 延期帐号分析
 */

import accountChart from '../../charts/account';

module.exports = {
    title: '延期帐号分析',
    menuIndex: 5,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
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
