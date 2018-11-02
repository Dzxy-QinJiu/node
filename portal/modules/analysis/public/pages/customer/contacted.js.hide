/**
 * 已联系客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '已联系客户分析',
    menuIndex: 9,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        customerChart.getCustomerDealChart('dealed', '团队或个人成交分析(假数据)'),
    ];
}
