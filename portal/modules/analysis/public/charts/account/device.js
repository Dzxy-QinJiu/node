/**
 * 设备统计
 */

import { ifNotSingleApp, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToSalesId } from '../../utils';

export function getAccountDeviceChart(type = 'all') {
    return {
        title: Intl.get('oplate.user.analysis.device', '设备统计'),
        url: '/rest/analysis/user/v3/:auth_type/device',
        conditions: [{
            name: 'analysis_type',
            value: type
        }],
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToSalesId(arg);
        },
        chartType: 'bar',
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
