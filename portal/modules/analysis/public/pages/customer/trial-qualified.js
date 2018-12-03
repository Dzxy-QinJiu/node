/**
 * 试用合格客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    id: 'TRIAL_QUALIFIED',
    title: '试用合格客户分析',
    menuIndex: 5,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //试用合格客户数统计
        customerChart.getCustomerTrialQualifiedNumChart(),
        //试用合格组成
        customerChart.getCustomerTrialQualifiedComposeChart(),
        //地域统计
        customerChart.getCustomerTrialQualifiedDistributionChart('地域统计', 'province'),
        //行业统计
        customerChart.getCustomerTrialQualifiedDistributionChart('行业统计', 'industry'),
        //趋势图
        customerChart.getCustomerTrialQualifiedTrendChart(),
        //试用合格客户数统计
        customerChart.getCustomerTrialQualifiedChart(),
    ];
}
