/**
 * 试用合格客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
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
        //趋势图
        customerChart.getCustomerTrialQualifiedTrendChart(),
        //试用合格客户数统计
        customerChart.getCustomerTrialQualifiedChart(),
        /*
        //地域统计
        customerChart.getCustomerZoneChart('total', '地域统计(假数据)'),
        //行业统计
        customerChart.getCustomerIndustryChart('total', '行业统计(假数据)'),
        */
    ];
}
