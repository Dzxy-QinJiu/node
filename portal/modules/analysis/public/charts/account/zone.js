/**
 * 账号地域统计
 */

import { unknownDataMap, USER_TYPES, USER_TYPES_WITH_TITLE } from '../../consts';
import { argCallbackUnderlineTimeToTime } from '../../utils';


export function getAccountZoneChart(type = 'total', title) {
    return {
        title: title || Intl.get('user.analysis.address', '地域统计'),
        url: `/rest/analysis/user/v1/:auth_type/apps/${type}/zone`,
        argCallback: argCallbackUnderlineTimeToTime,
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
