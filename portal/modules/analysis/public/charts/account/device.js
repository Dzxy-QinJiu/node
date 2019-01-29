/**
 * 设备统计
 */

import { ifNotSingleApp, argCallbackTeamId, argCallbackMemberIdToSalesId } from '../../utils';

export function getAccountDeviceChart(type = 'all') {
    return {
        title: Intl.get('oplate.user.analysis.device', '设备统计'),
        url: '/rest/analysis/user/v3/:auth_type/device',
        argCallback: arg => {
            argCallbackTeamId(arg);
            argCallbackMemberIdToSalesId(arg);
            _.set(arg, 'query.analysis_type', type);
        },
        chartType: 'bar',
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
