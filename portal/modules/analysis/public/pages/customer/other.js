/**
 * 其他
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '其他',
    menuIndex: 9,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        customerChart.getCustomerDealChart(),
    ];
}
