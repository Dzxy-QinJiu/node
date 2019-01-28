/**
 * 设备统计
 */

import { ifNotSingleApp, argCallbackTeamId, argCallbackMemberIdToSalesId } from '../../utils';

export function getAccountDeviceChart(type = 'total') {
    return {
        title: Intl.get('oplate.user.analysis.device', '设备统计'),
        url: '/rest/analysis/user/v3/:auth_type/device',
        argCallback: arg => {
            argCallbackTeamId(arg);
            argCallbackMemberIdToSalesId(arg);
        },
        chartType: 'bar',
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
