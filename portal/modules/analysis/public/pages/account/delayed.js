/**
 * 延期帐号分析
 */

import {ACCOUNT_MENUS} from '../../consts';
import accountChart from '../../charts/account';

module.exports = {
    title: ACCOUNT_MENUS.DELAYED.name,
    key: ACCOUNT_MENUS.DELAYED.key,
    menuIndex: 5,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    //是否只能选择一个应用
    isCanOnlySelectSingleApp: true,
    charts: getCharts()
};

function getCharts() {
    return [
        //团队分布统计
        accountChart.getDelayedAccountTeamChart(),
        //设备统计
        accountChart.getAccountDeviceChart('delay'),
        //浏览器统计
        accountChart.getAccountBrowserChart('delay'),
        //用户访问次数
        accountChart.getLoginCountsChart('delay'),
        //用户访问天数
        accountChart.getLoginDaysChart('delay'),
        //用户在线时间
        accountChart.getLoginTimesChart('delay'),
        //平均在线时长
        accountChart.getAverageOnlineTimeChart('delay'),
        //活跃用户地域统计
        accountChart.getActiveAreaChart('delay'),
    ];
}
