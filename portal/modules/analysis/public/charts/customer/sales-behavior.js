/**
 * 销售行为统计
 */

export function getSalesBehaviorChart() {
    return {
        title: '销售行为统计',
        chartType: 'table',
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/recent/contact/customer',
        dataField: 'list',
        //processData: (data) => {
        option: {
            columns: [
                {
                    title: '团队',
                    dataIndex: 'team_name',
                    isSetCsvValueBlank: true,
                    render: (text, item, index) => {
                        return {
                            children: text,
                            props: {
                                rowSpan: item.rowSpan
                            },
                        };
                    },
                    width: 100
                },
                {
                    title: Intl.get('user.salesman', '销售人员'),
                    dataIndex: 'user_name',
                    isSetCsvValueBlank: true,
                    width: 80
                },
                {
                    title: Intl.get('oplate_customer_analysis.newCustomerCount', '新开客户数'),
                    dataIndex: 'newly_customer',
                    align: 'right',
                    width: 80
                },
                {
                    title: Intl.get('oplate_customer_analysis.tatolNewCustomerCount', '新开账号数总数'),
                    dataIndex: 'tatol_newly_users',
                    align: 'right',
                    width: 80
                },
                {
                    title: Intl.get('oplate_customer_analysis.customerLoginCount', '新开通客户登录数'),
                    dataIndex: 'customer_login',
                    align: 'right',
                    width: 80
                }
            ],
        }
    };
}
