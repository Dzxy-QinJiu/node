/**
 * 流失客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '流失客户分析',
    menuIndex: 6,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        customerChart.getCustomerTrendChart('dealed', '流失客户趋势'),
        customerChart.getCustomerLossCashChart('dealed', '流失现金统计'),
        customerChart.getCustomerZoneChart('dealed', '区域分析'),
        customerChart.getCustomerLossReasonChart('dealed', '流失原因统计'),
    ];
}
