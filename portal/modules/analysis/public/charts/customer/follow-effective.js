/**
 * 联合跟进客户活跃率统计
 */

export function getFollowUpCustomerEffectiveChart() {

    return {
        title: Intl.get('analysis.statistics.of.active.rate.of.follow.customers', '联合跟进客户活跃率统计'),
        url: '/rest/analysis/customer/v3/:data_type/follow/customer/active_rate',
        argCallback: arg => {
            delete arg.query.app_id;
            delete arg.query.interval;
            delete arg.query.time_range;
            // 默认true是负责人, 对联合跟进人进行统计，需要传false,
            arg.query.is_owner = false;
        },
        chartType: 'table',
        dataField: 'list',
        option: {
            pagination: false,
            scroll: {y: 170},
            columns: [
                {
                    title: Intl.get('common.definition', '名称'),
                    dataIndex: 'name',
                    width: 100,
                    render: (text, record) => {
                        // 有昵称的时候显示昵称，没有的时候显示团队名称
                        const nickName = _.get(record, 'nick_name', '');
                        const teamName = _.get(record, 'team_name');
                        const name = nickName ? nickName : teamName;
                        return (
                            <div>{name}</div>
                        );
                    }
                },
                {
                    title: Intl.get('effective.customer.number', '有效客户数'),
                    titleTip: Intl.get('analysis.number.of.customers.with.an.account', '有账号的客户数'),
                    dataIndex: 'follow_num',
                    align: 'right',
                },
                {
                    title: Intl.get('active.customer.number', '活跃客户数'),
                    titleTip: Intl.get('analysis.number.of.customers.whose.accounts.have.been.logged.in', '有账号登录过的客户数'),
                    dataIndex: 'active_num',
                    align: 'right',
                },
                {
                    title: Intl.get('effective.customer.activity.rate', '有效客户活跃率'),
                    dataIndex: 'active_rate',
                    align: 'right',
                    showAsPercent: true
                },
            ],
        },
    };
}

