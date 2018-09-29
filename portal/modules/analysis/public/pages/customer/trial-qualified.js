/**
 * 试用合格客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '试用合格客户分析',
    menuIndex: 8,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //试用合格客户数统计
        customerChart.getCustomerTrialEffectiveChart(),
    ];
}
