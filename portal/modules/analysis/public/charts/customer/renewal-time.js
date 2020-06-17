/**
 * 客户续签时间统计
 */

export function getRenewalCustomerTimeChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.customer.renewal.time.statistics', '客户续签时间统计'),
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
                    let count = point.count;
                    //未来时间数据显示为空
                    if ( moment(item.timestamp).add(index, 'month').isAfter(moment()) ) {
                        count = '';
                    }
                    processedItem['month' + index] = count;
                });

                return processedItem;
            });
        },
        option: {
            columns: (() => {
                let columns = [
                    {
                        title: Intl.get('common.login.time', '时间'),
                        dataIndex: 'time',
                        width: 80
                    }, {
                        title: Intl.get('analysis.number.of.customers.due', '到期客户数'),
                        dataIndex: 'due_num',
                        align: 'right',
                        width: 90
                    }, {
                        title: Intl.get('analysis.renewal.of.current.month', '当月续签'),
                        dataIndex: 'month0',
                        align: 'right',
                        width: 75
                    }
                ];

                for (let i = 1; i < 13; i++) {
                    let columnWidth = 85;
                    if (i === 12) {
                        columnWidth = 100;
                    } else if (i > 9) {
                        columnWidth = 90;
                    } 
                    columns.push({
                        title: Intl.get('analysis.renewal.of.current.month', '当月续签') + i + Intl.get('user.apply.detail.delay.month.show', '个月'),
                        dataIndex: `month${i}`,
                        align: 'right',
                        width: columnWidth
                    });
                }

                return columns;
            })(),
        },
    };
}
