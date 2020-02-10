/**
 * 活跃用户地域统计
 */

import { ifNotSingleApp, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToSalesId } from '../../utils';

export function getActiveAreaChart(type = 'all') {
    return {
        title: Intl.get('user.analysis.active.user.area.statistics', '活跃用户地域统计'),
        url: '/rest/analysis/user/v3/:auth_type/zone/province',
        conditions: [{
            name: 'analysis_type',
            value: type
        }, {
            name: 'active_type',
            value: 'all',
        }],
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToSalesId(arg);

            //活跃类型参数里的员工类型实际上是用户属性，只是通过活跃类型参数传过来的，在实际向接口提交之前，需要把它赋给用户类型参数
            if (arg.query.active_type === 'internal') {
                arg.query.type = arg.query.active_type;
                delete arg.query.active_type;
            }
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
        cardContainer: {
            selectors: [{
                options: [
                    {name: Intl.get('common.all', '全部'), value: 'all'},
                    {name: Intl.get('user.type.employee', '员工'), value: 'internal'},
                    {name: Intl.get('analysis.exclude.ip.staff': '排除配置ip和员工',), value: 'valid'},
                ],
                activeOption: 'all',
                conditionName: 'active_type',
            }],
        },
    };
}
