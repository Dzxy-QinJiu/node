/**
 * 总体分析
 */

import { argCallbackUnderlineTimeToTime } from '../../utils';
import customerChart from '../../charts/customer';

module.exports = {
    title: '总体分析',
    menuIndex: 1,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts({
        type: 'total',
        argCallback: argCallbackUnderlineTimeToTime
    })
};

function getCharts(paramObj) {
    return [
        //趋势统计
        customerChart.getCustomerTrendChart(paramObj),
        //客户阶段统计
        customerChart.getCustomerStageChart(paramObj),
        //地域统计
        customerChart.getCustomerZoneChart(paramObj),
        //行业统计
        customerChart.getCustomerIndustryChart(paramObj),
        //团队统计
        customerChart.getCustomerTeamChart(paramObj),
        //客户覆盖率统计
        customerChart.getCustomerCoverageChart(),
    ];
}
