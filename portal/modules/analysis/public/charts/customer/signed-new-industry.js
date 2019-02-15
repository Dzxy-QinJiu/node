/**
 * 新签行业分布
 */

export function getSignedCustomerNewIndustryChart(paramObj = {}) {
    return {
        title: '新签行业分布',
        url: '/rest/analysis/customer/label/:data_type/sign/industry',
        argCallback: paramObj.argCallback,
        chartType: 'bar',
        customOption: {
            reverse: true
        },
    };
}
