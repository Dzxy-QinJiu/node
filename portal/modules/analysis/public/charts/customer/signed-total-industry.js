/**
 * 签约客户行业分布
 */

export function getSignedCustomerTotalIndustryChart() {
    return {
        title: '签约客户行业分布',
        url: '/rest/analysis/customer/label/:data_type/sign/total/industry',
        chartType: 'bar',
        customOption: {
            reverse: true
        },
    };
}
