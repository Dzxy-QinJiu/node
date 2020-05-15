/**
 * 各阶段活跃客户统计
 */

const STAGES = ['信息', '意向', '试用', 'AQL', '机会', '签约', '续约'];

export function getStageActiveCustomerChart() {
    return {
        title: '各阶段活跃客户统计',
        chartType: 'table',
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/customer/v3/:data_type/customer/active/druid',
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

                    _.each(STAGES, item => {
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
        processData: data => {
            return _.map(data, dataItem => {
                return _.extend(dataItem, dataItem.label_active);
            });
        },
        option: {
            columns: [
                {
                    title: '团队',
                    dataIndex: 'team_name',
                    width: 100
                },
                {
                    title: '信息阶段',
                    dataIndex: '信息',
                    align: 'right',
                    width: 100
                },
                {
                    title: '意向阶段',
                    dataIndex: '意向',
                    align: 'right',
                    width: 100
                },
                {
                    title: '试用阶段',
                    dataIndex: '试用',
                    align: 'right',
                    width: 100
                },
                {
                    title: 'AQL',
                    dataIndex: 'AQL',
                    align: 'right',
                    width: 100
                },
                {
                    title: '机会',
                    dataIndex: '机会',
                    align: 'right',
                    width: 100
                },
                {
                    title: '签约',
                    dataIndex: '签约',
                    align: 'right',
                    width: 100
                },
                {
                    title: '续约',
                    dataIndex: '续约',
                    align: 'right',
                    width: 100
                },
            ],
        },
        processOption: (option, chart) => {
            if (_.get(chart, 'data[0].nick_name')) {
                option.columns.unshift({
                    title: '销售',
                    dataIndex: 'nick_name',
                    width: 100
                });
            }
        },
    };
}
