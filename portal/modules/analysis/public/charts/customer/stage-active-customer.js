/**
 * 各阶段活跃客户统计
 */

const columnWidth = 60; // 列宽

export function getStageActiveCustomerChart() {
    return {
        title: Intl.get('analysis.active.customer.statistics.at.all.stages', '各阶段活跃客户统计'),
        chartType: 'table',
        url: '/rest/analysis/customer/v3/:data_type/customer/active/druid',
        cardContainer: {
            selectors: [{
                options: [{
                    name: Intl.get('analysis.all.administrative.levels', '全部行政级别'),
                    value: '',
                },{
                    name: Intl.get('crm.Administrative.level.0', '部委级'),
                    value: '0',
                },{
                    name: Intl.get('crm.Administrative.level.1', '省部级'),
                    value: '1',
                },{
                    name: Intl.get('crm.Administrative.level.2', '地市级'),
                    value: '2',
                },{
                    name: Intl.get('crm.Administrative.level.3', '区县级'),
                    value: '3',
                }],
                activeOption: '',
                conditionName: 'administrative_level',
            }],
        },
        conditions: [
            {
                name: 'administrative_level',
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
                    title: Intl.get('user.user.team', '团队'),
                    dataIndex: 'team_name',
                    width: 100
                },
                {
                    title: Intl.get('sales.stage.message', '信息'),
                    dataIndex: '信息',
                    align: 'right',
                    width: columnWidth
                },
                {
                    title: Intl.get('sales.stage.intention', '意向'),
                    dataIndex: '意向',
                    align: 'right',
                    width: columnWidth
                },
                {
                    title: Intl.get('common.trial', '试用'),
                    dataIndex: '试用',
                    align: 'right',
                    width: columnWidth
                },
                {
                    title: 'AQL',
                    dataIndex: 'AQL',
                    align: 'right',
                    width: columnWidth
                },
                {
                    title: Intl.get('common.chance', '机会'),
                    dataIndex: '机会',
                    align: 'right',
                    width: columnWidth
                },
                {
                    title: Intl.get('common.official', '签约'),
                    dataIndex: '签约',
                    align: 'right',
                    width: columnWidth
                },
                {
                    title: Intl.get('contract.163', '续约'),
                    dataIndex: '续约',
                    align: 'right',
                    width: columnWidth
                },
            ],
        },
        processOption: (option, chart) => {
            if (_.get(chart, 'data[0].nick_name')) {
                option.columns.unshift({
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'nick_name',
                    width: 100
                });
            }
        },
    };
}
