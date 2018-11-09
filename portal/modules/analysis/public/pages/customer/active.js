/**
 * 客户活跃度分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '客户活跃度分析',
    menuIndex: 2,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //近一月活跃客户日活趋势
        customerChart.getCustomerActiveTrendChart('日活趋势图', 'day'),
        //近一季度活跃客户周活趋势
        customerChart.getCustomerActiveTrendChart('周活趋势图', 'week'),
        //近一年活跃客户月活趋势
        customerChart.getCustomerActiveTrendChart('月活趋势图', 'month'),
        //有效客户活跃率统计
        customerChart.getCustomerEffectiveChart(),
        //成交活跃客户统计
        customerChart.getCustomerDealActiveChart('成交活跃客户统计', ['签约', '续约']),
        //未成交活跃客户统计
        customerChart.getCustomerDealActiveChart('未成交活跃客户统计', ['信息', '意向', '试用', '流失']),
    ];
}
