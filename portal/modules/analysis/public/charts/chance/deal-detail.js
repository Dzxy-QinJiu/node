/**
 * 销售机会成交明细
 */

export function getChanceDealDetailChart() {
    return {
        title: '销售机会成交明细',
        chartType: 'table',
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/deal/detail',
        dataField: 'list',
        option: {
            columns: [
                {
                    title: '销售团队',
                    dataIndex: 'apply_team_name',
                    width: '10%',
                }, {
                    title: '销售经理',
                    dataIndex: 'apply_nick_name',
                    width: '10%',
                }, {
                    title: '销售机会',
                    dataIndex: 'customer_name',
                    width: '30%',
                }, {
                    title: '转入团队',
                    dataIndex: 'team_name',
                    width: '10%',
                }, {
                    title: '客户经理',
                    dataIndex: 'nick_name',
                    width: '10%',
                }
            ],
        },
    };
}
