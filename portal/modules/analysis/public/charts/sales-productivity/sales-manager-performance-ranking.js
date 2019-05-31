/**
 * 销售经理业绩排名
 */

export function getSalesManagerPerformanceRankingChart() {
    return {
        title: Intl.get('common.sales.manager.performance.ranking', '销售经理业绩排名'),
        chartType: 'table',
        layout: { sm: 24 },
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
        processOption: option => {
            const uniqTeams = _.uniqBy(option.dataSource, 'sales_team');

            //只有一个团队时
            if (uniqTeams.length === 1) {
                const teamColumnIndex = _.findIndex(option.columns, column => column.dataIndex === 'sales_team');

                if (teamColumnIndex !== -1) {
                    //去掉团队列
                    option.columns.splice(teamColumnIndex, 1);
                }
            }
        },
        option: {
            columns: [
                {
                    title: Intl.get('user.user.team', '团队'),
                    dataIndex: 'sales_team',
                    width: '10%',
                }, {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'member_name',
                    width: '10%',
                }, {
                    title: Intl.get('contract.29', '回款毛利'),
                    dataIndex: 'gross_profit',
                    sorter: sorter.bind(null, 'gross_profit'),
                    width: '10%',
                }, {
                    title: Intl.get('common.oppertunity.number', '机会数量'),
                    dataIndex: 'opportunity_count',
                    sorter: sorter.bind(null, 'opportunity_count'),
                    width: '10%',
                }, {
                    title: Intl.get('common.deal.number', '成交数'),
                    dataIndex: 'deal_count',
                    sorter: sorter.bind(null, 'deal_count'),
                    width: '10%',
                }, {
                    title: Intl.get('common.deal.rate', '成交率'),
                    dataIndex: 'deal_rate',
                    showAsPercent: true,
                    sorter: sorter.bind(null, 'deal_rate'),
                    width: '10%',
                }, {
                    title: Intl.get('common.performance', '业绩'),
                    dataIndex: 'performance',
                    sorter: sorter.bind(null, 'performance'),
                    width: '10%',
                }, {
                    title: Intl.get('common.rank', '名次'),
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
                        name: Intl.get('common.current.week', '本周'),
                        value: 'week'
                    },
                    {
                        name: Intl.get('common.this.month', '本月'),
                        value: 'month'
                    },
                    {
                        name: Intl.get('common.current.quarter', '本季度'),
                        value: 'quarter'
                    },
                    {
                        name: Intl.get('common.current.year', '本年'),
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
