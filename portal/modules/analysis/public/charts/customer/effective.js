/**
 * 客户活跃率统计
 * 包括 负责客户活跃率统计 和 联合跟进客户活跃率统计
 */

import { argCallbackMemberIdsToMemberId } from '../../utils';

export function getCustomerEffectiveChart(paramObj = {}) {
    const { title, url, isFollowUp } = paramObj;
    return {
        title: title,
        url: url,
        argCallback: arg => {
            if (isFollowUp) {
                // 默认true是负责人, 对联合跟进人进行统计，需要传false,
                arg.query.is_owner = false;
            } else {
                argCallbackMemberIdsToMemberId(arg);
                _.set(arg, 'query.interval', 'day');
            }
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
                        let name = text;
                        if (isFollowUp) {
                            name = _.get(record, 'nick_name') || _.get(record, 'team_name');
                        }
                        return (name);
                    }
                },
                {
                    title: Intl.get('effective.customer.number', '有效客户数'),
                    titleTip: Intl.get('analysis.number.of.customers.with.an.account', '有账号的客户数'),
                    dataIndex: isFollowUp ? 'follow_num' : 'valid',
                    align: 'right',
                },
                {
                    title: Intl.get('active.customer.number', '活跃客户数'),
                    titleTip: Intl.get('analysis.number.of.customers.whose.accounts.have.been.logged.in', '有账号登录过的客户数'),
                    dataIndex: isFollowUp ? 'active_num' : 'active',
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
