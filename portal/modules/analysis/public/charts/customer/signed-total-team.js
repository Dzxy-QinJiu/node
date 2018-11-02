/**
 * 签约客户团队分布
 */

export function getSignedCustomerTotalTeamChart() {
    return {
        title: '签约客户团队分布',
        url: '/rest/analysis/customer/label/:data_type/sign/total/team',
        chartType: 'bar',
    };
}
