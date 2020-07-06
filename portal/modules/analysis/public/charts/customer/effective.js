/**
 * 客户活跃率统计
 * 包括 负责客户活跃率统计 和 联合跟进客户活跃率统计
 */

export function getCustomerEffectiveChart(paramObj = {}) {
    const url = '/rest/analysis/customer/v3/:data_type/follow/customer/active_rate';

    const activeParamMap = {
        'responsible': {
            title: Intl.get('analysis.statistics.of.active.rate.of.effective.customers', '负责客户活跃率统计'),
        },
        'follow': {
            title: Intl.get('analysis.statistics.of.active.rate.of.follow.customers', '联合跟进客户活跃率统计'),
            argCallback: arg => {
                arg.query.is_owner = false; // 默认true是负责人, 对联合跟进人进行统计，需要传false,
            }
        }

    };
    const { type } = paramObj;
    const activeParam = activeParamMap[type];

    return {
        title: activeParam.title,
        url: activeParam.url || url,
        argCallback: arg => {
            delete arg.query.app_id;
            delete arg.query.interval;
            delete arg.query.time_range;
            _.isFunction(activeParam.argCallback) && activeParam.argCallback(arg);
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
                        return _.get(record, 'nick_name') || _.get(record, 'team_name');
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
