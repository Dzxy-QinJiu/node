/**
 * 新开客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '新开客户分析',
    menuIndex: 4,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增趋势
        customerChart.getCustomerTrendChart('added'),
        //团队统计
        customerChart.getCustomerTeamChart('added'),
        //地域统计
        customerChart.getCustomerZoneChart('added'),
        //行业统计
        customerChart.getCustomerIndustryChart('added'),
        //新开客户转化率统计
        customerChart.getNewCustomerConvertRateChart(),
        //销售新开客户数统计
        customerChart.getSalesNewOpenChart(),
    ];
}
