/**
 * 新增用户分析
 */

import accountChart from '../../charts/account';
import {ACCOUNT_MENUS} from '../../consts';

module.exports = {
    title: ACCOUNT_MENUS.NEW_ADD.name,
    key: ACCOUNT_MENUS.NEW_ADD.key,
    menuIndex: 2,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增用户数统计
        accountChart.getAccountNumChart('added', '新增用户数统计'),
        //新增用户来源分类统计
        accountChart.getAccountSourceChart('added', '新增用户来源分类统计'),
        //行业统计
        accountChart.getAccountIndustryChart('added', '新增用户行业统计'),
        //团队统计
        accountChart.getAccountTeamChart('added', '新增用户团队统计'),
        //用户类型
        accountChart.getAccountTypeChart('added'),
        //状态统计
        accountChart.getAccountStatusChart('added'),
        //单应用用户活跃度趋势
        accountChart.getActivityChart('new_added'),
        //用户天留存统计
        accountChart.getRemainAccountChart({interval: 'day', title: '用户天留存'}),
        //用户周留存统计
        accountChart.getRemainAccountChart({interval: 'week', title: '用户周留存', range: 10}),
        //用户月留存统计
        accountChart.getRemainAccountChart({interval: 'month', title: '用户月留存', range: 10}),
        //设备统计
        accountChart.getAccountDeviceChart('add'),
        //浏览器统计
        accountChart.getAccountBrowserChart('add'),
        //用户访问次数
        accountChart.getLoginCountsChart('add'),
        //用户访问天数
        accountChart.getLoginDaysChart('add'),
        //用户在线时间
        accountChart.getLoginTimesChart('add'),
        //平均在线时长
        accountChart.getAverageOnlineTimeChart('add'),
        //销售开通单应用用户登录统计
        accountChart.getSalesOpenAccountLoginChart(),
        //活跃用户地域统计
        accountChart.getActiveAreaChart('add'),
    ];
}
