/**
 * 销售行为统计
 */

export const salesBehaviorChart = {
    title: Intl.get('common.sales.behavior.statistics', '销售行为统计'),
    chartType: 'table',
    url: '/rest/analysis/customer/v2/:data_type/last_contact/deal/statistics',
    argCallback: arg => {
        if (arg.query.member_id) {
            arg.query.member_ids = arg.query.member_id;
            delete arg.query.member_id;
        }
    },
    option: {
        columns: [{
            title: '联系客户数',
            dataIndex: 'total',
            width: '25%',
        }, {
            title: '成交数',
            dataIndex: 'deal',
            width: '25%',
        }, {
            title: '未成交数',
            dataIndex: 'no_deal',
            width: '25%',
        }, {
            title: '成交率',
            dataIndex: 'deal_rate',
            width: '25%',
        }]
    },
    processData: data => [data.result],
};
