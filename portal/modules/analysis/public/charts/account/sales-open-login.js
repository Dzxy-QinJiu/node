/**
 * 销售开通单应用账号登录统计
 */

import { isSales, argCallbackUnderlineTimeToTime } from '../../utils';
import {storageUtil} from 'ant-utils';
import {STORED_APP_ID_KEY} from '../../consts';

export function getSalesOpenAccountLoginChart() {
    return {
        title: Intl.get('user.analysis.account.login.statistics', '开通用户登录统计'),
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
        processOption: option => {
            let columns = [
                {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'member_name',
                    width: '25%',
                },
                {
                    title: Intl.get('user.analysis.user.count', '开通用户数'),
                    dataIndex: 'new_users',
                    align: 'right',
                    width: '25%',
                },
                {
                    title: Intl.get('user.analysis.account.login.count', '实际登录数'),
                    dataIndex: 'login_user',
                    align: 'right',
                    width: '25%',
                }
            ];

            const storedAppId = storageUtil.local.get(STORED_APP_ID_KEY);

            //选择全部或多个应用时显示应用名
            if (!storedAppId || storedAppId === 'all' || _.includes(storedAppId, ',')) {
                const appColumn = {
                    title: Intl.get('common.product','产品'),
                    dataIndex: 'app_name',
                    width: '25%',
                };

                columns.splice(1, 0, appColumn);
            }

            option.columns = columns;
        },
    };
}
