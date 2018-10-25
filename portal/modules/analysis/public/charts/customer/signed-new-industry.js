/**
 * 新签行业分布
 */

export function getSignedCustomerNewIndustryChart() {
    return {
        title: '新签行业分布',
        url: '/rest/analysis/customer/label/:data_type/sign/industry',
        chartType: 'bar',
        customOption: {
            reverse: true
        },
    };
}
