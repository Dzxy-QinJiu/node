/**
 * 销售行为统计
 */

export function getSalesBehaviorChart() {
    return {
        title: '销售行为统计',
        chartType: 'table',
        layout: {sm: 24},
        height: 'auto',
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

            //按团队名前两个字分组，将同大区的排到一块儿
            let firsetLevelGroupedData = _.groupBy(data, item => item.sales_team.substr(0,2));

            _.each(firsetLevelGroupedData, item => {
                //在大区内按团队名长度排序，把大区名排在前面
                item.sort((a, b) => a.sales_team.length - b.sales_team.length);

                //在大区内按团队名分组，将同团队的排到一块儿
                const secondLevelGroupedData = _.groupBy(item, 'sales_team');

                _.each(secondLevelGroupedData, rows => {
                    processedData = processedData.concat(rows);
                });
            });

            return processedData;
        },
        option: {
            columns: [
                {
                    title: Intl.get('user.user.team', '团队'),
                    dataIndex: 'sales_team',
                    isSetCsvValueBlank: true,
                    width: 60
                },
                {
                    title: Intl.get('user.salesman', '销售人员'),
                    dataIndex: 'nick_name',
                    isSetCsvValueBlank: true,
                    width: 60
                },
                {
                    title: Intl.get('contract.169', '客户数'),
                    dataIndex: 'customer_num',
                    width: 60
                },
                {
                    title: Intl.get('common.number.of.unremarked.customer', '填写跟进记录客户数'),
                    dataIndex: 'customer_remark_num',
                    width: 110
                },
                {
                    title: Intl.get('common.number.of.remarked.customer', '未填写跟进记录客户数'),
                    dataIndex: 'customer_no_remark_num',
                    width: 110
                },
                {
                    title: Intl.get('oplate_customer_analysis.newCustomerCount', '新开客户数'),
                    dataIndex: 'customer_new_num',
                    width: 80
                },
                {
                    title: Intl.get('common.number.of.trial.qualified.customer', '试用合格客户数'),
                    dataIndex: 'customer_qualify_num',
                    width: 80
                },
                {
                    title: Intl.get('common.number.of.travel.day', '出差天数'),
                    dataIndex: 'business_days',
                    width: 80
                },
                {
                    title: Intl.get('common.number.of.customers.visited', '拜访客户数'),
                    dataIndex: 'customer_visit_num',
                    width: 80
                },
                {
                    title: Intl.get('common.daily.duration.of.calls', '日均电话时长') + '(' + Intl.get('user.time.second', '秒') + ')',
                    dataIndex: 'average_billsec',
                    width: 90
                },
                {
                    title: Intl.get('common.daily.number.of.calls', '日均电话数'),
                    dataIndex: 'average_total',
                    width: 80
                }
            ],
        }
    };
}
