/**
 * 销售行为统计
 */

export function getSalesBehaviorChart(paramObj = {}) {
    return {
        title: Intl.get('common.sales.behavior.statistics', '销售行为统计'),
        chartType: 'table',
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/callrecord/v1/sales_comprehensive/statistics',
        ajaxInstanceFlag: 'sales_behavior',
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

            //团队列表
            const teamList = paramObj.teamList;

            if (teamList) {
                //按团队列表中的团队顺序对数据进行重新排序
                _.each(teamList, team => {
                    _.each(data, item => {
                        if (item.sales_team_id === team.group_id) {
                            processedData.push(item);
                        }
                    });
                });
            }

            return processedData;
        },
        option: {
            columns: [
                {
                    title: Intl.get('user.user.team', '团队'),
                    dataIndex: 'sales_team',
                    isSetCsvValueBlank: true,
                    width: 50
                },
                {
                    title: Intl.get('user.salesman', '销售人员'),
                    dataIndex: 'nick_name',
                    isSetCsvValueBlank: true,
                    width: 55
                },
                {
                    title: Intl.get('contract.169', '客户数'),
                    dataIndex: 'customer_num',
                    align: 'right',
                    width: 50
                },
                {
                    title: Intl.get('common.number.of.unremarked.customer', '填写跟进记录客户数'),
                    dataIndex: 'customer_remark_num',
                    align: 'right',
                    width: 100
                },
                {
                    title: Intl.get('common.number.of.remarked.customer', '未填写跟进记录客户数'),
                    dataIndex: 'customer_no_remark_num',
                    align: 'right',
                    width: 110
                },
                {
                    title: Intl.get('analysis.new.open.account.number', '新开帐号数'),
                    dataIndex: 'customer_new_num',
                    align: 'right',
                    width: 65
                },
                {
                    title: Intl.get('analysis.extended.account.number', '延期帐号数'),
                    dataIndex: 'extended_user_num',
                    align: 'right',
                    width: 65
                },
                {
                    title: Intl.get('common.number.of.trial.qualified.customer', '试用合格客户数'),
                    dataIndex: 'customer_qualify_num',
                    align: 'right',
                    width: 80
                },
                {
                    title: Intl.get('common.number.of.travel.day', '出差天数'),
                    dataIndex: 'business_days',
                    align: 'right',
                    width: 55
                },
                {
                    title: Intl.get('common.number.of.customers.visited', '拜访客户数'),
                    dataIndex: 'customer_visit_num',
                    align: 'right',
                    width: 65
                },
                {
                    title: Intl.get('common.daily.duration.of.calls', '日均电话时长') + '(' + Intl.get('user.time.second', '秒') + ')',
                    dataIndex: 'average_billsec',
                    align: 'right',
                    width: 90
                },
                {
                    title: Intl.get('common.daily.number.of.calls', '日均电话数'),
                    dataIndex: 'average_total',
                    align: 'right',
                    width: 65
                }
            ],
        }
    };
}
