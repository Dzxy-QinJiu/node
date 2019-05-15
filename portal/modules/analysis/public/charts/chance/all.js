/**
 * 所有机会统计
 */

export function getAllChanceChart(specifyColumns) {
    return {
        title: '所有机会统计',
        chartType: 'table',
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/statistics',
        ajaxInstanceFlag: 'sales_opportuniry_all',
        argCallback: arg => {
            //因为要统计所有机会，所以将开始时间设为0，以统计截止到选择的结束时间的所有数据
            _.set(arg, 'query.start_time', 0);

            const statisticsType = _.get(arg, 'query.statistics_type');
            
            //这个接口的返回类型参数和别的接口不一样，需要处理一下
            if (statisticsType) {
                _.set(arg, 'query.result_type', statisticsType);

                delete arg.query.statistics_type;
            }
        },
        dataField: 'list',
        option: {
            columns: [
                {
                    title: '团队',
                    dataIndex: 'sales_team',
                    width: '20%',
                }, {
                    title: '成员',
                    dataIndex: 'nick_name',
                    width: '20%',
                }, {
                    title: '提交数',
                    dataIndex: 'total',
                    width: '20%',
                }, {
                    title: '成交数',
                    dataIndex: 'deal',
                    width: '20%',
                }, {
                    title: '成交率',
                    dataIndex: 'deal_rate',
                    width: '20%',
                    render: text => {
                        text = (text * 100).toFixed(2) + '%';
                        return <span>{text}</span>;
                    }
                }
            ],
        },
        processOption: (option, chartProps) => {
            //如果指定了要显示的列
            if (specifyColumns) {
                //按指定的显示
                option.columns = _.filter(option.columns, column => specifyColumns.includes(column.dataIndex));
            } else {
                //接口返回数据中的第一条记录
                const firstDataItem = _.get(chartProps.data, '[0]');

                //如果接口返回数据中的第一条记录中不包含团队字段，需要把列定义中的团队列移除掉
                if (!_.has(firstDataItem, 'sales_team')) {
                    const teamNameColumnIndex = _.findIndex(option.columns, column => column.dataIndex === 'sales_team');

                    if (teamNameColumnIndex > -1) {
                        option.columns.splice(teamNameColumnIndex, 1);
                    }
                }

                //如果接口返回数据中的第一条记录中不包含昵称字段，说明返回的是团队数据，需要把列定义中的成员列移除掉
                if (!_.has(firstDataItem, 'nick_name')) {
                    const memberNameColumnIndex = _.findIndex(option.columns, column => column.dataIndex === 'nick_name');

                    if (memberNameColumnIndex > -1) {
                        option.columns.splice(memberNameColumnIndex, 1);
                    }
                }
            }
        },
    };
}
