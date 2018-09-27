/**
 * 新增账号分析
 */

import accountChart from '../../charts/account';
import { USER_TYPES, userTypeDataMap } from '../../consts';

module.exports = {
    title: '新增账号分析',
    menuIndex: 3,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //用户类型
        accountChart.getTypeChart(),
        //地域统计
        accountChart.getZoneChart('added'),
        //行业统计
        accountChart.getIndustryChart('added'),
        //团队统计
        accountChart.getTeamChart('added'),
        //登录统计
        accountChart.getOpenAccountChart('added'),
        //留存统计
        accountChart.getRemainAccountChart('added'),
    ];
}
