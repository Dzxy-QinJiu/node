/**
 * 总体分析
 */

import orderChart from '../../charts/order';

module.exports = {
    title: '总体分析',
    menuIndex: 1,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        orderChart.getOrderStageChart(),
    ];
}
