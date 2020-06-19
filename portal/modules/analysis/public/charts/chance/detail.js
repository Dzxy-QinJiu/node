/**
 * 销售机会明细
 */

export function getChanceDetailChart() {
    return {
        title: Intl.get('analysis.opportunity.details', '销售机会明细'),
        chartType: 'table',
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/stage',
        conditions: [{
            name: 'page_size',
            value: 9999
        }],
        dataField: 'list',
        option: {
            columns: [
                {
                    title: Intl.get('crm.customer.transfer.sales', '销售经理'),
                    dataIndex: 'apply_nick_name',
                    width: 90,
                }, {
                    title: Intl.get('user.sales.team', '销售团队'),
                    dataIndex: 'apply_team_name',
                    width: 90,
                }, {
                    title: Intl.get('apply.approve.sales.opportunity', '销售机会'),
                    dataIndex: 'customer_name',
                }, {
                    title: Intl.get('analysis.transfer.to.team', '转入团队'),
                    dataIndex: 'team_name',
                    width: 90,
                }, {
                    title: Intl.get('crm.customer.transfer.manager', '客户经理'),
                    dataIndex: 'nick_name',
                    width: 90,
                }, {
                    title: Intl.get('analysis.sign.or.not', '是否签单'),
                    dataIndex: 'if_sign',
                    width: 90,
                }
            ],
        },
    };
}
