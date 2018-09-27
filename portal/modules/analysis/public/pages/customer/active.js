/**
 * 客户活跃度分析
 */

import { numToPercent } from '../../utils';

module.exports = {
    title: '客户活跃度分析',
    menuIndex: 3,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [{
        title: Intl.get('effective.customer.statistics', '有效客户统计'),
        url: '/rest/analysis/customer/v2/:data_type/customer/active_rate',
        argCallback: (arg) => {
            let query = arg.query;

            if (query && query.starttime && query.endtime) {
                query.start_time = query.starttime;
                query.end_time = query.endtime;
                delete query.starttime;
                delete query.endtime;
            }
        },
        conditions: [
            {
                name: 'interval',
                value: 'day',
            },
        ],
        chartType: 'table',
        dataField: 'list',
        option: {
            pagination: false,
            scroll: {y: 170},
            columns: [
                {
                    title: Intl.get('common.definition', '名称'),
                    dataIndex: 'name',
                    width: 80,
                },
                {
                    title: Intl.get('effective.customer.number', '有效客户数'),
                    dataIndex: 'valid',
                },
                {
                    title: Intl.get('active.customer.number', '活跃客户数'),
                    dataIndex: 'active',
                },
                {
                    title: Intl.get('effective.customer.activity.rate', '有效客户活跃率'),
                    dataIndex: 'active_rate',
                    render: text => {
                        return <span>{numToPercent(text)}</span>;
                    }
                },
            ],
        },
    }, {
        title: Intl.get('active.customer.trends.last.month', '近一月活跃客户趋势'),
        url: '/rest/analysis/customer/v2/:data_type/customer/active_rate',
        argCallback: (arg) => {
            let query = arg.query;

            if (query && query.starttime && query.endtime) {
                query.start_time = moment().subtract(1, 'months').valueOf();
                query.end_time = moment().valueOf();
                delete query.starttime;
                delete query.endtime;
            }
        },
        conditions: [
            {
                name: 'interval',
                value: 'day',
            },
        ],
        chartType: 'line',
        dataField: 'total',
        processData: data => {
            _.each(data, dataItem => {
                if (dataItem.date_str) {
                    dataItem.name = dataItem.date_str.substr(5);
                    dataItem.value = dataItem.active;
                }
            });

            return data;
        },
        option: {
            grid: {
                right: 0,
            },
            tooltip: {
                formatter: params => {
                    const dateStr = params[0].name;
                    const activeNum = params[0].value;
                    const activeRate = this.numToPercent(params[0].data.active_rate);
                    const effectiveNum = params[0].data.valid;

                    return `
                        ${dateStr}<br>
                        ${Intl.get('active.customer.number', '活跃客户数')}: ${activeNum}<br>
                        ${Intl.get('effective.customer.activity.rate', '有效客户活跃率')}: ${activeRate}<br>
                        ${Intl.get('effective.customer.number', '有效客户数')}: ${effectiveNum}
                    `;
                },
            },
        },
    }];
}
