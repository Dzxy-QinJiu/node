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
        customerChart.getCustomerTrendChart('dealed', '续约客户时间统计(假数据)'),
    ];
}
