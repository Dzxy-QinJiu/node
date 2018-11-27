/**
 * 设备统计
 */

import { ifNotSingleApp } from '../../utils';

export function getAccountDeviceChart(type = 'total') {
    return {
        title: Intl.get('oplate.user.analysis.device', '设备统计'),
        url: '/rest/analysis/user/v3/:auth_type/device',
        chartType: 'bar',
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
