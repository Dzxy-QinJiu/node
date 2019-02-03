/**
 * 签约客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '签约客户分析',
    menuIndex: 3,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //签约客户总体趋势
        customerChart.getSignedCustomerTotalTrendChart(),
        //签约客户净增分析
        customerChart.getSignedCustomerNetIncreaseChart(),
        //签约客户毛利分析
        customerChart.getSignedCustomerGrossProfitChart(),
        //签约客户行政级别市场占有率分析
        customerChart.getSignedCustomerAdministrativeLevelCoverageChart(),
        //签约客户地域市场占有率分析
        customerChart.getSignedCustomerZoneCoverageChart(),
        //新签客户趋势
        customerChart.getSignedCustomerNewTrendChart(),
        //签约客户行业分布
        customerChart.getSignedCustomerTotalIndustryChart(),
        //签约客户团队分布
        customerChart.getSignedCustomerTotalTeamChart(),
        //新签行业分布
        customerChart.getSignedCustomerNewIndustryChart(),
        //新签团队分布
        customerChart.getSignedCustomerNewTeamChart(),
        //续签客户趋势
        customerChart.getRenewalCustomerTrendChart(),
        //续签客户地域统计
        customerChart.getRenewalCustomerZoneChart(),
        //续签客户毛利统计
        customerChart.getRenewalCustomerGrossProfitChart(),
        //流失客户趋势统计
        customerChart.getLossCustomerTrendChart(),
        //流失现金趋势统计
        customerChart.getLossCashTrendChart(),
        //流失客户地域统计
        customerChart.getLossCustomerZoneChart(),
        //流失客户团队统计
        customerChart.getLossCustomerTeamChart(),
        //流失客户总体情况分析
        customerChart.getLossCustomerOverviewChart(),
        //客户续签时间统计
        customerChart.getRenewalCustomerTimeChart(),
    ];
}
