/**
 * 新开客户登录情况统计
 */

export const newCustomerLoginChart = (teamId, memberId) => {
    return {
        title: Intl.get('common.new.customer.login.statistics', '新开客户登录情况统计'),
        chartType: 'table',
        url: '/rest/analysis/customer/v2/statistic/:auth_type/customer/user/new',
        conditions: [{
            name: 'team_id',
            value: teamId,
        }],
        processData: data => {
            const teamData = _.get(data, 'list[0].team_result');
            const memberData = _.find(teamData, item => item.user_id === memberId);

            if (memberData) {
                return [memberData];
            } else {
                return [];
            }
        },
        option: {
            columns: [
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
        },
    };
};
