/**
 * 账号行业统计
 */

import { unknownDataMap, USER_TYPES, USER_TYPES_WITH_TITLE } from '../../consts';
import { argCallbackUnderlineTimeToTime, argCallbackMemberIdsToMemberId } from '../../utils';

export function getAccountIndustryChart(type = 'total', title) {
    return {
        title: title || Intl.get('user.analysis.industry', '行业统计'),
        url: `/rest/analysis/user/v1/:auth_type/apps/${type}/industry`,
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
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
