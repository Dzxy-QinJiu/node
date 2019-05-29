/**
 * 销售经理业绩排名
 */

export function getSalesManagerPerformanceRankingChart() {
    return {
        title: '销售经理业绩排名',
        chartType: 'table',
        url: '/rest/analysis/contract/contract/v2/:data_type/performance/order/sales-manager',
        conditions: [{
            name: 'time_interval',
            value: 'week'
        }],
        argCallback: arg => {
            let query = arg.query;

            const endTime = moment();
            const timeInterval = query.time_interval;

            query.interval = timeInterval;
            query.start_time = endTime.clone().startOf(timeInterval).valueOf();
            query.end_time = endTime.valueOf();

            delete query.time_interval;
        },
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
                    title: '回款毛利',
                    dataIndex: 'gross_profit',
                    sorter: sorter.bind(null, 'gross_profit'),
                    width: '10%',
                }, {
                    title: '机会数量',
                    dataIndex: 'opportunity_count',
                    sorter: sorter.bind(null, 'opportunity_count'),
                    width: '10%',
                }, {
                    title: '业绩',
                    dataIndex: 'performance',
                    sorter: sorter.bind(null, 'performance'),
                    width: '10%',
                }, {
                    title: '名次',
                    dataIndex: 'order',
                    sorter: sorter.bind(null, 'order'),
                    width: '10%',
                }
            ],
        },
        cardContainer: {
            selectors: [{
                options: [
                    {
                        name: '本周',
                        value: 'week'
                    },
                    {
                        name: '本月',
                        value: 'month'
                    },
                    {
                        name: '本季度',
                        value: 'quarter'
                    },
                    {
                        name: '本年',
                        value: 'year'
                    }
                ],
                activeOption: 'week',
                conditionName: 'time_interval',
            }],
        },
    };

    function sorter(f, a, b) {
        return a[f] - b[f];
    }
}
