/**
 * 签约客户活跃度
 */

import { argCallbackUnderlineTimeToTime, argCallbackMemberIdsToMemberId } from '../../utils';

export function getSignedCustomerActivityChart() {
    return {
        title: Intl.get('common.signed.customer.activity', '签约客户活跃度'),
        chartType: 'line',
        url: '/rest/analysis/customer/label/:data_type/active/trend',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackMemberIdsToMemberId(arg);
            //统计时间间隔用图上选择的而非公共参数里的
            arg.query.interval = arg.query.param_interval;
        },
        processData: (data, chart) => {
            const intervalCondition = _.find(chart.conditions, item => item.name === 'param_interval');
            let interval = _.get(intervalCondition, 'value');

            return _.map(data, dataItem => {
                if (!interval || interval === 'day') {
                    dataItem.name = moment(dataItem.timestamp).format(oplateConsts.DATE_FORMAT);
                } else {
                    if (interval === 'week') {
                        //用iso格式的周开始时间，这样是从周一到周天算一周，而不是从周天到周六
                        interval = 'isoweek';
                    } else {
                        interval = interval.replace('ly', '');
                    }

                    const startDate = moment(dataItem.timestamp).startOf(interval).format(oplateConsts.DATE_FORMAT);
                    const endDate = moment(dataItem.timestamp).endOf(interval).format(oplateConsts.DATE_MONTH_DAY_FORMAT);

                    dataItem.name = `${startDate}${Intl.get('contract.83', '至')}${endDate}`;
                }

                return dataItem;
            });
        },
        cardContainer: {
            operateButtons: [{value: 'day', name: Intl.get('operation.report.day.active', '日活')},
                {value: 'week', name: Intl.get('operation.report.week.active', '周活')},
                {value: 'month', name: Intl.get('operation.report.month.active', '月活')}],
            activeButton: 'day',
            conditionName: 'param_interval',
        },
        conditions: [{
            name: 'param_interval',
            value: 'day',
        }, {
            name: 'customer_label',
            value: Intl.get('common.official', '签约') + Intl.get('contract.163', '续约')
        }],
        option: {
            grid: {
                left: 20
            },
            tooltip: {
                formatter: params => {
                    const data = params[0].data;
                    const cardTab = data.cardTab;
                    let name = data.name;

                    if (cardTab === 'week') {
                        name = `${name} - ${moment().format(oplateConsts.DATE_FORMAT)}`;
                    } else if (cardTab === 'month') {
                        name = moment(name).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
                    }

                    return `
                        ${name}<br>
                        ${Intl.get('operation.report.active.num', '活跃数')}：${data.value}<br>
                        ${Intl.get('operation.report.total.num', '总数')}：${data.total}<br>
                        ${Intl.get('operation.report.active', '活跃率')}：${(data.percent * 100).toFixed(2)}%
                    `;
                },
            },
            yAxis: [{
                //设置成1保证坐标轴分割刻度显示成整数
                minInterval: 1,
            }]
        },
        customOption: {
            yAxises: [
                {
                    name: Intl.get('contract.169', '客户数'),
                },
                {
                    name: Intl.get('operation.report.active', '活跃率'),
                    position: 'right',
                    min: 0,
                    max: 100,
                    splitNumber: 1,
                },
            ],
        },
        csvOption: {
            rowNames: [
                {
                    name: Intl.get('common.login.time', '时间'),
                    key: 'name',
                },
                {
                    name: Intl.get('operation.report.active.num', '活跃数'),
                    key: 'value',
                },
                {
                    name: Intl.get('operation.report.active', '活跃率'),
                    key: 'percent',
                    render: function(td) {
                        return `${(td * 100).toFixed(2)}%`;
                    }
                },
                {
                    name: Intl.get('operation.report.total.num', '总数'),
                    key: 'total',
                },
            ],
        },
    };
}
