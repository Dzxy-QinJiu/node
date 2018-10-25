/**
 * 续约客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '续约客户分析',
    menuIndex: 5,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        customerChart.getCustomerTrendChart('dealed', '续约客户总体趋势(假数据)'),
    ];
}
