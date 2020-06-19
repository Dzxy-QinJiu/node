/**
 * 账号状态统计
 */

import { ifNotSingleApp, argCallbackUnderlineTimeToTime } from '../../utils';

export function getAccountStatusChart(type = 'total', title) {
    return {
        title: title || Intl.get('analysis.account.status.statistics', '账号状态统计'),
        url: `/rest/analysis/user/v1/:auth_type/${type}/status`,
        argCallback: argCallbackUnderlineTimeToTime,
        chartType: 'pie',
        nameValueMap: {
            '0': Intl.get('common.stop', '停用'),
            '1': Intl.get('common.enabled', '启用'),
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
