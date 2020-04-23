/**
 * 市场线索分配统计
 */

export function getClueDistributionChart() {
    return {
        title: Intl.get('analysis.market.lead.allocation.statistics', '市场线索分配统计'),
        chartType: 'table',
        url: '/rest/analysis/customer/v3/lead/:data_type/inbound/interaction',
        argCallback: arg => {
            arg.query.statistics_type = 'user';
        },
        dataField: 'list',
        option: {
            columns: [{
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'user_name',
                width: '10%',
            }, {
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: '10%',
            }, {
                title: Intl.get('analysis.assigned.clue.number', '分配线索数'),
                dataIndex: 'count',
                align: 'right',
                width: '10%',
            }, {
                title: Intl.get('analysis.follow-up.leads', '跟进线索数'),
                dataIndex: 'traced_count',
                align: 'right',
                width: '10%',
            }]
        },
    };
}
