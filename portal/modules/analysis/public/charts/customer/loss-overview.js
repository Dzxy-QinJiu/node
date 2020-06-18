/**
 * 流失客户总体情况分析
 */

export function getLossCustomerOverviewChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.analysis.on.the.general.situation.of.lost.customers', '流失客户总体情况分析'),
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/churn/overview',
        argCallback: paramObj.argCallback,
        option: {
            columns: [{
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'member_name',
                width: '20%',
            }, {
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: '20%',
            }, {
                title: Intl.get('crm.41', '客户名'),
                dataIndex: 'customer_name',
                width: '40%',
            }, {
                title: Intl.get('analysis.application', '应用'),
                dataIndex: 'apps',
                width: '20%',
                render: text => {
                    return _.map(text, item => (
                        <div>{item}</div>
                    ));
                }
            }],
        },
    };
}
