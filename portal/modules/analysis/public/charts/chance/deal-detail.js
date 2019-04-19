/**
 * 销售机会成交明细
 */

export function getChanceDealDetailChart() {
    return {
        title: '销售机会成交明细',
        chartType: 'table',
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/deal/detail',
        dataField: 'list',
        processData: data => {
            let processedData = [];

            let groupedData = _.groupBy(data, 'apply_team_name');

            _.each(groupedData, rows => {
                _.first(rows).rowSpan = rows.length;
                processedData = processedData.concat(rows);
            });

            return processedData;
        },
        option: {
            columns: [
                {
                    title: '销售团队',
                    dataIndex: 'apply_team_name',
                    width: '10%',
                    render: (value, row) => {
                        let obj = {
                            children: value,
                            props: {
                                rowSpan: row.rowSpan || 0
                            }
                        };

                        return obj;
                    }
                }, {
                    title: '销售经理',
                    dataIndex: 'apply_nick_name',
                    width: '10%',
                }, {
                    title: '销售机会',
                    dataIndex: 'customer_name',
                    width: '30%',
                }, {
                    title: '转入团队',
                    dataIndex: 'team_name',
                    width: '10%',
                }, {
                    title: '客户经理',
                    dataIndex: 'nick_name',
                    width: '10%',
                }
            ],
        },
    };
}
