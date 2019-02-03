/**
 * 新开客户分析
 */

import { argCallbackMemberIdToIds } from '../../utils';
import customerChart from '../../charts/customer';

module.exports = {
    title: '新开客户分析',
    menuIndex: 4,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts({
        type: 'added',
        argCallback: argCallbackMemberIdToIds
    })
};

function getCharts(paramObj) {
    return [
        //新增趋势
        customerChart.getCustomerTrendChart(paramObj),
        //团队统计
        customerChart.getCustomerTeamChart(paramObj),
        //地域统计
        customerChart.getCustomerZoneChart(paramObj),
        //行业统计
        customerChart.getCustomerIndustryChart(paramObj),
        //新开客户转化率统计
        customerChart.getNewCustomerConvertRateChart(paramObj),
        //销售新开客户数统计
        customerChart.getSalesNewOpenChart(paramObj),
    ];
}
