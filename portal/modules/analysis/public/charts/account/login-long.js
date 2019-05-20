/**
 * 在线时长统计
 */

import { ifNotSingleApp, argCallbackUnderlineTimeToTime } from '../../utils';

export function getLoginLongChart(type = 'total') {
    let url = `/rest/analysis/user/v1/${type}/login_long`;

    if (type === 'total') {
        url = `/rest/analysis/user/v1/all/${type}/login_long`;
    }

    return {
        title: Intl.get('oplate.user.analysis.6', '在线时长统计'),
        url,
        conditions: [{
            name: 'ranges',
            value: 1,
        }],
        argCallback: argCallbackUnderlineTimeToTime,
        chartType: 'pie',
        nameValueMap: {
            0: Intl.get('oplate.user.analysis.7', '时长小于1小时'),
            1: Intl.get('oplate.user.analysis.8', '时长大于1小时'),
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
