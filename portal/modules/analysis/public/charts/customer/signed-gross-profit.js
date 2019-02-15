/**
 * 签约客户毛利分析
 */

export function getSignedCustomerGrossProfitChart(paramObj = {}) {
    return {
        title: '签约客户毛利分析',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/sign/customer',
        argCallback: paramObj.argCallback,
        processData: data => [data],
        option: {
            columns: [{
                title: '新签',
                dataIndex: 'new_gross_profit',
                width: '20%',
            }, {
                title: '回流',
                dataIndex: 'reflux_gross_profit',
                width: '20%',
            }, {
                title: '扩展',
                dataIndex: 'expansion_gross_profit',
                width: '20%',
            }, {
                title: '流失',
                dataIndex: 'churn_gross_profit',
                width: '20%',
            }, {
                title: '净增',
                dataIndex: 'net_new_gross_profit',
                width: '20%',
            }],
        },
    };
}
