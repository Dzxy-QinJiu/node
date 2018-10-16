/**
 * 账号行业统计
 */

import { unknownDataMap, USER_TYPES, USER_TYPES_WITH_TITLE } from '../../consts';

export function getUserIndustryChart(type = 'total', title) {
    return {
        title: title || Intl.get('user.analysis.industry', '行业统计'),
        url: `/rest/analysis/user/v1/:auth_type/apps/${type}/industry`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        customOption: {
            stack: true,
            legendData: USER_TYPES,
        },
        csvOption: {
            rowNames: USER_TYPES_WITH_TITLE,
        },
    };
}
