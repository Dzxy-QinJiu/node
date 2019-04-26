/**
 * 销售行为统计
 */

export function getSalesBehaviorChart() {
    return {
        title: '销售行为统计',
        chartType: 'table',
        layout: {sm: 24},
        url: '/rest/analysis/callrecord/v1/sales_comprehensive/statistics',
        dataField: 'list',
        conditions: [{
            name: 'filter_phone',
            value: false
        }, {
            name: 'filter_invalid_phone',
            value: false
        }],
        processData: data => {
            let processedData = [];

            //添加未填写跟进记录客户数
            _.each(data, item => {
                item.customer_no_remark_num = item.customer_num - item.customer_remark_num;
            });

            let groupedData = _.groupBy(data, 'sales_team');

            _.each(groupedData, rows => {
                _.first(rows).rowSpan = rows.length;
                processedData = processedData.concat(rows);
            });

            return processedData;
        },
        option: {
            columns: [
                {
                    title: '团队',
                    dataIndex: 'sales_team',
                    isSetCsvValueBlank: true,
                    render: (value, row) => {
                        let obj = {
                            children: value,
                            props: {
                                rowSpan: row.rowSpan || 0
                            }
                        };

                        return obj;
                    },
                    width: 60
                },
                {
                    title: '销售人员',
                    dataIndex: 'nick_name',
                    isSetCsvValueBlank: true,
                    width: 60
                },
                {
                    title: '客户数',
                    dataIndex: 'customer_num',
                    width: 60
                },
                {
                    title: '填写跟进客户数',
                    dataIndex: 'customer_remark_num',
                    width: 80
                },
                {
                    title: '未填写跟进客户数',
                    dataIndex: 'customer_no_remark_num',
                    width: 90
                },
                {
                    title: '新开客户数',
                    dataIndex: 'customer_new_num',
                    width: 80
                },
                {
                    title: '试用合格客户数',
                    dataIndex: 'customer_qualify_num',
                    width: 80
                },
                {
                    title: '出差天数',
                    dataIndex: 'business_days',
                    width: 80
                },
                {
                    title: '拜访客户数',
                    dataIndex: 'customer_visit_num',
                    width: 80
                },
                {
                    title: '日均电话时长',
                    dataIndex: 'average_billsec',
                    width: 80
                },
                {
                    title: '日均电话数',
                    dataIndex: 'average_total',
                    width: 80
                }
            ],
        }
    };
}
