/**
 * 活跃度
 */

import { ifNotSingleApp, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToSalesId } from '../../utils';

export function getActivityChart(type, title) {
    let url;

    if (type === 'new_added') {
        url = '/rest/analysis/user/v1/:auth_type/new_added/users/activation/:param_interval';
    } else if (type === 'expired') {
        url = '/rest/analysis/user/v1/:auth_type/expired/:app_id/users/activation/:param_interval';
    } else if (type === 'signed') {
        url = '/rest/analysis/user/v3/:auth_type/active_percent/trend';
    } else {
        url = '/rest/analysis/user/v1/:auth_type/:app_id/users/activation/:param_interval';
    }

    return {
        title: title || Intl.get('operation.report.activity', '活跃度'),
        chartType: 'line',
        url,
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToSalesId(arg);

            if (type === 'signed') {
                arg.query.analysis_type = '正式用户';
                arg.query.interval = arg.params.param_interval;
            } else {
                //去掉query参数中的公共interval，以免引起迷惑
                delete arg.query.interval;
            }
        },
        processData: (data, chart) => {
            const intervalCondition = _.find(chart.conditions, item => item.name === 'param_interval');
            let interval = _.get(intervalCondition, 'value');

            return _.map(data, dataItem => {
                if (!interval || interval === 'daily') {
                    dataItem.name = moment(dataItem.timestamp).format(oplateConsts.DATE_FORMAT);
                } else {
                    if (interval === 'weekly') {
                        //用iso格式的周开始时间，这样是从周一到周天算一周，而不是从周天到周六
                        interval = 'isoweek';
                    } else {
                        interval = interval.replace('ly', '');
                    }

                    const startDate = moment(dataItem.timestamp).startOf(interval).format(oplateConsts.DATE_FORMAT);
                    const endDate = moment(dataItem.timestamp).endOf(interval).format(oplateConsts.DATE_MONTH_DAY_FORMAT);

                    dataItem.name = `${startDate}${Intl.get('contract.83', '至')}${endDate}`;
                }

                dataItem.value = dataItem.active;

                return dataItem;
            });
        },
        cardContainer: {
            operateButtons: [{value: 'daily', name: Intl.get('operation.report.day.active', '日活')},
                {value: 'weekly', name: Intl.get('operation.report.week.active', '周活')},
                {value: 'monthly', name: Intl.get('operation.report.month.active', '月活')}],
            activeButton: 'daily',
            conditionName: 'param_interval',
        },
        conditions: [{
            name: 'param_interval',
            value: 'daily',
            type: 'params',
        }],
        option: {
            tooltip: {
                formatter: params => {
                    const data = params[0].data;
                    const cardTab = data.cardTab;
                    let name = data.name;

                    if (cardTab === 'weekly') {
                        name = `${name} - ${moment().format(oplateConsts.DATE_FORMAT)}`;
                    } else if (cardTab === 'monthly') {
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
                    name: Intl.get('operation.report.user.count', '用户数'),
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
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
