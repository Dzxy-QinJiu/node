/**
 * 客户流失率统计
 */

export function getCustomerLoseRateChart() {
    return {
        title: '客户流失率统计',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/churn/team',
        argCallback: args => {
            if (args.query && args.query.start_time) {
                args.query.starttime = args.query.start_time;
                delete args.query.start_time;
            }

            if (args.query && args.query.end_time) {
                args.query.endtime = args.query.end_time;
                delete args.query.end_time;
            }
        },
        option: {
            columns: [{
                title: '流失客户数',
                dataIndex: 'count',
                width: '25%'
            }, {
                title: '客户流失率',
                dataIndex: 'count_percent',
                render: value => <span>{value * 100 + '%'}</span>,
                width: '25%'
            }, {
                title: '流失毛利(单位：万)',
                dataIndex: 'gross_profit',
                width: '25%'
            }, {
                title: '毛利流失率',
                dataIndex: 'gross_profit_percent',
                render: value => <span>{value * 100 + '%'}</span>,
                width: '25%'
            }]
        }
    };
}
