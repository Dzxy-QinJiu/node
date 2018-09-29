/**
 * 市场占有率分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '市场占有率分析',
    menuIndex: 2,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //客户覆盖率统计
        customerChart.getCustomerCoverageChart(),
    ];
}
