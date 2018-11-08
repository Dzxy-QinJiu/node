/**
 * 签约客户净增分析
 */

export function getSignedCustomerNetIncreaseChart() {
    return {
        title: '签约客户净增分析',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/sign/customer',
        processData: data => [data],
        option: {
            columns: [{
                title: '新签',
                dataIndex: 'new_customers',
            }, {
                title: '回流',
                dataIndex: 'reflux_customers',
            }, {
                title: '流失',
                dataIndex: 'churn_customers',
            }, {
                title: '净增',
                dataIndex: 'net_new_customers',
            }],
        },
    };
}
