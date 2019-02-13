/**
 * 账号团队统计
 */

import { isSales } from '../../utils';
import { unknownDataMap, USER_TYPES, USER_TYPES_WITH_TITLE } from '../../consts';

export function getAccountTeamChart(type = 'total', title) {
    return {
        title: title || Intl.get('user.analysis.team', '团队统计'),
        url: `/rest/analysis/user/v1/:auth_type/apps/${type}/team`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        customOption: {
            stack: true,
            legendData: USER_TYPES,
        },
        csvOption: {
            rowNames: USER_TYPES_WITH_TITLE,
        },
        noShowCondition: {
            callback: () => isSales()
        },
    };
}
