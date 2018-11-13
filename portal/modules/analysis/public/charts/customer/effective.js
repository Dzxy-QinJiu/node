/**
 * 有效客户统计
 */

import { numToPercent } from '../../utils';

export function getCustomerEffectiveChart() {
    return {
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
    };
}
