/**
 * 账号状态统计
 */

import { userTypeDataMap, USER_TYPES } from '../../consts';

export function getAccountStatusChart(type = 'total', title) {
    return {
        title: title || '账号状态统计',
        url: `/rest/analysis/user/v1/:auth_type/${type}/status`,
        chartType: 'pie',
        noShowCondition: {
            callback: conditions => {
                const appId = conditions.app_id;

                if (appId && (appId.includes('all') || appId.includes(','))) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        nameValueMap: {
            '0': Intl.get('common.stop', '停用'),
            '1': Intl.get('common.enabled', '启用'),
        },
    };
}
