/**
 * 签约客户净增分析
 */

export function getSignedCustomerNetIncreaseChart(paramObj = {}) {
    return {
        title: '签约客户净增分析',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/sign/customer',
        argCallback: paramObj.argCallback,
        processData: data => [data],
        option: {
            columns: [{
                title: '新签',
                dataIndex: 'new_customers',
                width: '25%',
            }, {
                title: '回流',
                dataIndex: 'reflux_customers',
                width: '25%',
            }, {
                title: '流失',
                dataIndex: 'churn_customers',
                width: '25%',
            }, {
                title: '净增',
                dataIndex: 'net_new_customers',
                width: '25%',
            }],
        },
    };
}
