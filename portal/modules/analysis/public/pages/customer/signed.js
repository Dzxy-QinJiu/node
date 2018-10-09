/**
 * 签约客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '签约客户分析',
    menuIndex: 4,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        customerChart.getCustomerTrendChart('dealed', '签约客户总体趋势'),
        customerChart.getCustomerTrendChart('dealed', '新签约客户趋势'),
        customerChart.getCustomerIndustryChart('dealed', '新签行业分布'),
        customerChart.getCustomerTeamChart('dealed', '新签团队分布'),
    ];
}
