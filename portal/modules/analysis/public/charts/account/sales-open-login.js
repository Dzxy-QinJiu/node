/**
 * 销售开通单应用账号登录统计
 */

import { isSales, argCallbackUnderlineTimeToTime } from '../../utils';

export function getSalesOpenAccountLoginChart() {
    return {
        title: Intl.get('user.analysis.account.login.statistics', '开通账号登录统计'),
        chartType: 'table',
        noShowCondition: {
            callback: () => isSales()
        },
        url: '/rest/analysis/user/v3/:data_type/login/detail',
        argCallback: (arg) => {
            argCallbackUnderlineTimeToTime(arg);

            let query = arg.query;

            if (query) {
                if (_.has(query, 'starttime') && _.has(query, 'endtime')) {
                    query.grant_create_begin_date = query.starttime;
                    query.grant_create_end_date = query.endtime;
                }
                // 团队参数
                if (query.team_ids) {
                    query.sales_team_id = query.team_ids;
                    delete query.team_ids;
                }
            }
        },
        option: {
            columns: [
                {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'member_name',
                    width: '40%',
                },
                {
                    title: Intl.get('user.analysis.account.count', '开通账号数'),
                    dataIndex: 'new_users',
                    align: 'right',
                    width: '30%',
                },
                {
                    title: Intl.get('user.analysis.account.login.count', '实际登录数'),
                    dataIndex: 'login_user',
                    align: 'right',
                    width: '30%',
                }
            ],
        },
    };
}
