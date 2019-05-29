/**
 * 总体分析
 */

import salesProductivityChart from '../../charts/sales-productivity';

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
        //销售经理业绩排名
        salesProductivityChart.getSalesManagerPerformanceRankingChart()
    ];
}
