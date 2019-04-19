/**
 * 销售机会成交明细
 */

export function getChanceDealDetailChart() {
    return {
        title: '销售机会成交明细',
        chartType: 'table',
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/stage',
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
