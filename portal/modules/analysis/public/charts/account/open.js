/**
 * 开通账号统计
 */

import Store from '../../store';

export function getOpenAccountChart() {
    return {
        title: Intl.get('user.analysis.account.login.statistics', '开通用户登录统计'),
        url: '/rest/analysis/user/v3/:data_type/login/detail',
        argCallback: (arg) => {
            let query = arg.query;

            if (query) {
                if (query.starttime && query.endtime) {
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
        conditions: [
            {
                name: 'app_id',
                value: Store.selectedAppId,
            },
        ],
        chartType: 'table',
        option: {
            columns: [
                {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'member_name',
                    width: '40%',
                },
                {
                    title: Intl.get('user.analysis.user.count', '开通用户数'),
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
        cardContainer: {
            selectors: [{
                optionsCallback: () => {
                    let options = [{
                        name: Intl.get('analysis.apply.all', '全部应用'),
                        value: '',
                    }];

                    _.map(Store.appList, item => {
                        options.push({
                            name: item.app_name,
                            value: item.app_id
                        });
                    });

                    return options;
                },
                activeOption: '',
                conditionName: 'app_id',
            }],
        }
    };
}
