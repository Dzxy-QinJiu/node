/**
 * 过期用户分析
 */

import accountChart from '../../charts/account';
import {ACCOUNT_MENUS} from '../../consts';

module.exports = {
    title: ACCOUNT_MENUS.EXPIRED.name,
    key: ACCOUNT_MENUS.EXPIRED.key,
    menuIndex: 3,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //过期用户数统计
        accountChart.getAccountNumChart('expired', '过期用户数统计'),
        //行业统计
        accountChart.getAccountIndustryChart('expired', '过期用户行业统计'),
        //团队统计
        accountChart.getAccountTeamChart('expired', '过期用户团队分布统计'),
        //用户类型
        accountChart.getAccountTypeChart('expired'),
        //状态统计
        accountChart.getAccountStatusChart('expired'),
        //单应用用户活跃度趋势
        accountChart.getActivityChart('expired'),
        //在线时长统计
        accountChart.getLoginLongChart('expired'),
        //设备统计
        accountChart.getAccountDeviceChart('expired'),
        //浏览器统计
        accountChart.getAccountBrowserChart('expired'),
        //用户访问次数
        accountChart.getLoginCountsChart('expired'),
        //用户访问天数
        accountChart.getLoginDaysChart('expired'),
        //用户在线时间
        accountChart.getLoginTimesChart('expired'),
        //平均在线时长
        accountChart.getAverageOnlineTimeChart('expired'),
        //活跃用户地域统计
        accountChart.getActiveAreaChart('expired'),
    ];
}
