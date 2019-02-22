/**
 * 新增账号分析
 */

import accountChart from '../../charts/account';

module.exports = {
    title: '新增账号分析',
    menuIndex: 2,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增账号数统计
        accountChart.getAccountNumChart('added', '新增账号数统计'),
        //新增帐号来源分类统计
        accountChart.getAccountSourceChart('added', '新增帐号来源分类统计'),
        //行业统计
        accountChart.getAccountIndustryChart('added', '新增账号行业统计'),
        //团队统计
        accountChart.getAccountTeamChart('added', '新增账号团队统计'),
        //账号类型
        accountChart.getAccountTypeChart('added'),
        //状态统计
        accountChart.getAccountStatusChart('added'),
        //单应用帐号活跃度趋势
        accountChart.getActivityChart('new_added'),
        //帐号天留存统计
        accountChart.getRemainAccountChart({interval: 'day', title: '帐号天留存'}),
        //帐号周留存统计
        accountChart.getRemainAccountChart({interval: 'week', title: '帐号周留存', range: 10}),
        //帐号月留存统计
        accountChart.getRemainAccountChart({interval: 'month', title: '帐号月留存', range: 10}),
        //设备统计
        accountChart.getAccountDeviceChart('add'),
        //浏览器统计
        accountChart.getAccountBrowserChart('add'),
        //用户访问次数
        accountChart.getLoginCountsChart('add'),
        //活跃用户地域统计
        accountChart.getActiveAreaChart('add'),
        //用户访问天数
        accountChart.getLoginDaysChart('add'),
        //用户在线时间
        accountChart.getLoginTimesChart('add'),
        //平均在线时长
        accountChart.getAverageOnlineTimeChart('add'),
        //销售开通单应用账号登录统计
        accountChart.getSalesOpenAccountLoginChart(),
    ];
}
