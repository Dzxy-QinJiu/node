/**
 * 签约客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '签约客户分析',
    menuIndex: 4,
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
        //客户续签时间统计
        customerChart.getRenewalCustomerTimeChart(),
        /*
        customerChart.getCustomerTrendChart('dealed', '流失客户趋势(假数据)'),
        customerChart.getCustomerLossCashChart('dealed', '流失现金统计(假数据)'),
        customerChart.getCustomerZoneChart('dealed', '区域分析(假数据)'),
        customerChart.getCustomerLossReasonChart('dealed', '流失原因统计(假数据)'),
        */
    ];
}
