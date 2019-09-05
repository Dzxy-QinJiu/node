/**
 * 客户经理业绩排名
 */

const calc = require('calculatorjs');

export function getCustomerManagerPerformanceRankingChart() {
    return {
        title: Intl.get('common.customer.manager.performance.ranking', '客户经理业绩排名'),
        chartType: 'table',
        layout: { sm: 24 },
        height: 'auto',
        url: '/rest/analysis/contract/contract/v2/performance/order/account_manager',
        processData: data => {
            _.each(data, item => {
                //                item.performance = calc.mul(item.performance, 100);
            });

            return data;
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
                    title: Intl.get('common.total.points', '总分'),
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
    };

    function sorter(f, a, b) {
        return a[f] - b[f];
    }
}
