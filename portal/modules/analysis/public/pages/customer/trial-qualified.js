/**
 * 试用合格客户分析
 */

import customerChart from '../../charts/customer';

module.exports = {
    title: '试用合格客户分析',
    menuIndex: 8,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //试用合格客户数统计
        customerChart.getCustomerTrialEffectiveChart(),
        //趋势统计
        customerChart.getCustomerTrendChart('total', '趋势统计(假数据)'),
        //历史净增
        customerChart.getCustomerTrendChart('total', '历史净增(假数据)'),
        //地域统计
        customerChart.getCustomerZoneChart('total', '地域统计(假数据)'),
        //行业统计
        customerChart.getCustomerIndustryChart('total', '行业统计(假数据)'),
    ];
}
