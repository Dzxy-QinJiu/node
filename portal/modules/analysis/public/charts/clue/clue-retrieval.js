/**
 * 销售提取线索统计
 */

export function getClueRetrievalChart() {
    return {
        title: Intl.get('analysis.sales.pull.lead.statistics', '销售提取线索统计'),
        chartType: 'table',
        url: '/rest/analysis/customer/v3/lead/:data_type/recommend/extract',
        argCallback: arg => {
            arg.query.statistics_type = 'user';
        },
        dataField: 'list',
        option: {
            columns: [{
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: '10%',
            }, {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'user_name',
                width: '10%',
            }, {
                title: Intl.get('analysis.extracting.cue.number', '提取线索数'),
                dataIndex: 'count',
                width: '10%',
            }, {
                title: Intl.get('analysis.follow-up.leads', '跟进线索数'),
                dataIndex: 'traced_count',
                width: '10%',
            }]
        },
    };
}
