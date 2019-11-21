/**
 * 总体分析
 */

import accountChart from '../../charts/account';
import {ACCOUNT_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

module.exports = {
    title: ACCOUNT_MENUS.OVERALL.name,
    key: ACCOUNT_MENUS.OVERALL.key,
    menuIndex: 1,
    privileges: [
        analysisPrivilegeConst.USER_ANALYSIS_MANAGER,
        analysisPrivilegeConst.USER_ANALYSIS_COMMON,
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //总体用户数统计
        accountChart.getAccountNumChart('total', Intl.get( 'user.statistics.total.user','总体用户数统计')),
        //总用户来源分类统计
        accountChart.getAccountSourceChart('total', Intl.get('user.statistics.total.user.source','总用户来源分类统计')),
        //有效用户数统计
        accountChart.getAccountValidChart(),
        //总用户地域统计 
        accountChart.getAccountZoneChart('total', Intl.get('user.statistics.total.user.area','总用户地域统计')),
        //总用户行业统计
        accountChart.getAccountIndustryChart('total', Intl.get('user.statistics.total.user.industry','总用户行业统计',)),
        //总用户团队统计
        accountChart.getAccountTeamChart('total', Intl.get('user.statistics.total.user.team','总用户团队统计')),
        //单应用用户类型统计
        accountChart.getAccountTypeChart(),
        //单应用用户状态统计
        accountChart.getAccountStatusChart(),
        //单应用用户活跃度趋势
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
        //销售开通用户统计
        accountChart.getAccountSalesOpenAccountChart(),
    ];
}
