/**
 * 成交/未成交活跃客户统计
 */

import { argCallbackMemberIdsToMemberId } from '../../utils';

export function getCustomerDealActiveChart(title = '', stages = []) {
    return {
        title,
        chartType: 'table',
        url: '/rest/analysis/customer/v2/:data_type/customer/active/statistics',
        argCallback: argCallbackMemberIdsToMemberId,
        cardContainer: {
            selectors: [{
                options: [{
                    name: '全部行政级别',
                    value: '',
                },{
                    name: '部委级',
                    value: '0',
                },{
                    name: '省部级',
                    value: '1',
                },{
                    name: '地市级',
                    value: '2',
                },{
                    name: '区县级',
                    value: '3',
                }],
                activeOption: '',
                conditionName: 'administrative_level',
            }, {
                optionsCallback: () => {
                    let options = [{
                        name: '全部标签',
                        value: '',
                    }];

                    _.each(stages, item => {
                        options.push({
                            name: item,
                            value: item
                        });
                    });

                    return options;
                },
                activeOption: '',
                conditionName: 'label',
            }],
        },
        conditions: [
            {
                name: 'administrative_level',
                value: '',
            },
            {
                name: 'label',
                value: '',
            },
        ],
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
                    align: 'right',
                    width: '50%'
                },
            ],
        },
        processData: data => {
            return _.map(data, dataItem => {
                let count = 0;

                _.each(dataItem, (value, key) => {
                    if (_.includes(stages, key)) {
                        count += dataItem[key].total;
                    }
                });

                const name = dataItem.team_name;

                return {name, count};
            });
        },
    };
}
