/**
 * 签约客户行业分布
 */

export function getSignedCustomerTotalIndustryChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.industry.distribution.of.contracted.customers', '签约客户行业分布'),
        url: '/rest/analysis/customer/label/:data_type/sign/total/industry',
        argCallback: paramObj.argCallback,
        chartType: 'bar',
        customOption: {
            reverse: true
        },
    };
}
