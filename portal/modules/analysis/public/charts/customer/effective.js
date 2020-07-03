/**
 * 负责客户活跃率统计
 */

import { argCallbackMemberIdsToMemberId } from '../../utils';

export function getCustomerEffectiveChart() {
    return {
        title: Intl.get('analysis.statistics.of.active.rate.of.follow.customers', '负责客户活跃率统计'),
        url: '/rest/analysis/customer/v2/:data_type/customer/active_rate',
        argCallback: arg => {
            argCallbackMemberIdsToMemberId(arg);
            _.set(arg, 'query.interval', 'day');
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
                },
                {
                    title: Intl.get('effective.customer.number', '有效客户数'),
                    titleTip: Intl.get('analysis.number.of.customers.with.an.account', '有账号的客户数'),
                    dataIndex: 'valid',
                    align: 'right',
                },
                {
                    title: Intl.get('active.customer.number', '活跃客户数'),
                    titleTip: Intl.get('analysis.number.of.customers.whose.accounts.have.been.logged.in', '有账号登录过的客户数'),
                    dataIndex: 'active',
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
