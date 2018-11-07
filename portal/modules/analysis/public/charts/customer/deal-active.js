/**
 * 成交/未成交活跃客户统计
 */

export function getCustomerDealActiveChart(title = '', stages = []) {
    return {
        title,
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
                    width: '50%'
                },
                {
                    title: '活跃客户数',
                    dataIndex: 'count',
                    width: '50%'
                },
            ],
        },
        processData: data => {
            return _.map(data, dataItem => {
                let count = 0;

                _.each(dataItem, (value, key) => {
                    if (stages.includes(key)) {
                        count += dataItem[key].total;
                    }
                });

                const name = dataItem.team_name;

                return {name, count};
            });
        },
    };
}
