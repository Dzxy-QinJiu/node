/**
 * 客户续签时间统计
 */

export function getRenewalCustomerTimeChart(paramObj = {}) {
    return {
        title: '客户续签时间统计',
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/customer/label/:data_type/renewal/time',
        argCallback: paramObj.argCallback,
        chartType: 'table',
        processData: data => {
            return _.map(data, item => {
                let processedItem = {
                    time: moment(item.timestamp).format('YYYYMM'),
                    due_num: item.total,
                };

                _.each(item.points, (point, index) => {
                    processedItem['month' + index] = point.count;
                });

                return processedItem;
            });
        },
        option: {
            columns: (() => {
                let columns = [
                    {
                        title: '时间',
                        dataIndex: 'time',
                    }, {
                        title: '到期客户数',
                        dataIndex: 'due_num',
                    }, {
                        title: '当月续签',
                        dataIndex: 'month0',
                    }
                ];

                for (let i = 1; i < 13; i++) {
                    columns.push({
                        title: `延期${i}个月`,
                        dataIndex: `month${i}`
                    });
                }

                return columns;
            })(),
        },
    };
}
