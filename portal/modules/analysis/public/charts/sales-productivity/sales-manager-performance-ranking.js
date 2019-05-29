/**
 * 销售经理业绩排名
 */

export function getSalesManagerPerformanceRankingChart() {
    return {
        title: '销售经理业绩排名',
        chartType: 'table',
        url: '/rest/analysis/contract/contract/v2/:data_type/performance/order/sales-manager',
        option: {
            columns: [
                {
                    title: '团队',
                    dataIndex: 'sales_team',
                    width: '10%',
                }, {
                    title: '销售',
                    dataIndex: 'member_name',
                    width: '10%',
                }, {
                    title: '业绩',
                    dataIndex: 'performance',
                    width: '10%',
                }, {
                    title: '回款毛利',
                    dataIndex: 'gross_profit',
                    width: '10%',
                }, {
                    title: '机会数量',
                    dataIndex: 'opportunity_count',
                    width: '10%',
                }, {
                    title: '名次',
                    dataIndex: 'order',
                    width: '10%',
                }
            ],
        },
    };
}
