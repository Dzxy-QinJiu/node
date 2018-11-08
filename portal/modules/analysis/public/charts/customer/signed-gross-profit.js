/**
 * 签约客户毛利分析
 */

export function getSignedCustomerGrossProfitChart() {
    return {
        title: '签约客户毛利分析',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/sign/customer',
        processData: data => [data],
        option: {
            columns: [{
                title: '新签',
                dataIndex: 'new_gross_profit',
            }, {
                title: '回流',
                dataIndex: 'reflux_gross_profit',
            }, {
                title: '扩展',
                dataIndex: 'expansion_gross_profit',
            }, {
                title: '流失',
                dataIndex: 'churn_gross_profit',
            }, {
                title: '净增',
                dataIndex: 'net_new_gross_profit',
            }],
        },
    };
}
