/**
 * 总体分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '总体分析',
    menuIndex: 1,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //趋势统计
        customerChart.getCustomerTrendChart(),
        //地域统计
        customerChart.getCustomerZoneChart(),
        //行业统计
        customerChart.getCustomerIndustryChart(),
        //团队统计
        customerChart.getCustomerTeamChart(),
        //客户阶段统计
        customerChart.getCustomerStageChart(),
    ];
}
