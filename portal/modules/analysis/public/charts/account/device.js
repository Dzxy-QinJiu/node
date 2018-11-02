/**
 * 账号状态统计
 */

import { ifNotSingleApp } from '../../utils';

export function getAccountDeviceChart(type = 'total', title) {
    return {
        title: title || Intl.get('oplate.user.analysis.device', '设备统计'),
        url: '/rest/analysis/user/v3/:auth_type/device',
        chartType: 'bar',
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
