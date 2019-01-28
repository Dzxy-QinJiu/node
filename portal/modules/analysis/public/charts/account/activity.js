/**
 * 活跃度
 */

import { ifNotSingleApp } from '../../utils';

export function getActivityChart(type = 'total', title) {
    return {
        title: title || Intl.get('operation.report.activity', '活跃度'),
        url: '/rest/analysis/user/v1/:auth_type/:app_id/users/activation/:interval',
        argCallback: arg => {
            const query = arg.query;

            if (query) {
                if (query.member_id) {
                    query.sales_id = query.member_id;
                    delete query.member_id;
                }

                if (query.team_ids) {
                    query.team_id = query.team_ids;
                    delete query.team_ids;
                }
            }
        },
        chartType: 'line',
        valueField: 'active',
        cardContainer: {
            operateButtons: [{value: 'daily', name: Intl.get('operation.report.day.active', '日活')},
                {value: 'weekly', name: Intl.get('operation.report.week.active', '周活')},
                {value: 'monthly', name: Intl.get('operation.report.month.active', '月活')}],
            activeButton: 'daily',
            conditionName: 'interval',
        },
        conditions: [{
            name: 'interval',
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
