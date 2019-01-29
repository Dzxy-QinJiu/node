/**
 * 活跃用户地域统计
 */

import { ifNotSingleApp, argCallbackTeamId, argCallbackMemberIdToSalesId } from '../../utils';

export function getActiveAreaChart() {
    return {
        title: Intl.get('user.analysis.active.user.area.statistics', '活跃用户地域统计'),
        url: '/rest/analysis/user/v3/:auth_type/zone/province',
        argCallback: arg => {
            argCallbackTeamId(arg);
            argCallbackMemberIdToSalesId(arg);
        },
        chartType: 'map',
        height: 546,
        csvOption: {
            reverse: true,
        },
        subChart: {
            chartType: 'table',
            option: {
                columns: [
                    {title: Intl.get('crm.96', '地域'), dataIndex: 'name', key: 'name'},
                    {title: Intl.get('operation.report.user.count', '用户数'), dataIndex: 'value', key: 'value', className: 'text-align-right'}
                ],
                pagination: {
                    pageSize: 12,
                },
            },
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
