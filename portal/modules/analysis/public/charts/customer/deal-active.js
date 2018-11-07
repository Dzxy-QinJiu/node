/**
 * 成交活跃客户统计
 */

import { numToPercent } from '../../utils';

export function getCustomerDealActiveChart() {
    return {
        title: '成交活跃客户统计',
        url: '/rest/analysis/customer/v2/:data_type/customer/active/statistics',
        argCallback: (arg) => {
            let query = arg.query;

            if (query && query.starttime && query.endtime) {
                query.start_time = query.starttime;
                query.end_time = query.endtime;
                delete query.starttime;
                delete query.endtime;
            }
        },
        /*
        conditions: [
            {
                name: 'label',
                value: 'day',
            },
        ],
        */
        chartType: 'table',
        dataField: 'list',
        option: {
            columns: [
                {
                    title: Intl.get('common.definition', '名称'),
                    dataIndex: 'name',
                },
                {
                    title: '活跃客户数',
                    dataIndex: 'count',
                },
            ],
        },
        processData: data => {
            return _.map(data, dataItem => {
                let count = 0;

                _.each(dataItem, (value, key) => {
                    if (['签约', '续约'].includes(key)) {
                        count += dataItem[key].total;
                    }
                });

                const name = dataItem.team_name;

                return {name, count};
            });
        },
    };
}
