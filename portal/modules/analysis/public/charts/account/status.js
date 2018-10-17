/**
 * 账号状态统计
 */

import { userTypeDataMap, USER_TYPES } from '../../consts';
import { ifNotSingleApp } from '../../utils';

export function getAccountStatusChart(type = 'total', title) {
    return {
        title: title || '账号状态统计',
        url: `/rest/analysis/user/v1/:auth_type/${type}/status`,
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
