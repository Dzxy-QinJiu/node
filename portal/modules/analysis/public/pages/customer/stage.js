/**
 * 阶段变更分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '阶段变更分析',
    menuIndex: 10,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //转出客户统计
        customerChart.getCustomerTransferChart(),
        //客户阶段变更统计
        customerChart.getCustomerStageChangeChart(),
    ];
}
