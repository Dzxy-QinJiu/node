/**
 * 客户活跃度分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '客户活跃度分析',
    menuIndex: 3,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //有效客户统计
        customerChart.getCustomerEffectiveChart(),
        //近一月活跃客户趋势
        customerChart.getCustomerActiveTrendChart(),
    ];
}
