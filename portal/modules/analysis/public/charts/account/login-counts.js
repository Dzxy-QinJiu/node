/**
 * 用户访问次数
 */

import { getRangeReqData, ifNotSingleApp, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToSalesId } from '../../utils';

export function getLoginCountsChart(type = 'all') {
    return {
        title: Intl.get('oplate.user.analysis.loginCounts', '用户访问次数'),
        url: '/rest/analysis/user/v3/:auth_type/logins/distribution/num',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToSalesId(arg);
        },
        reqType: 'post',
        conditions: [{
            value: getLoginNumReqData(),
            type: 'data',
        }, {
            name: 'analysis_type',
            value: type
        }],
        chartType: 'wordcloud',
        unit: Intl.get('common.label.times', '次'),
        csvOption: {
            thead: [Intl.get('user.login.time', '次数'), Intl.get('common.app.count', '数量')],
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}

function getLoginNumReqData() {
    return getRangeReqData(
        [
            [1, 2, 3, 4, 5, 6, 7, 8],
            {
                'from': 9,
                'to': 14
            },
            {
                'from': 15,
                'to': 25
            },
            {
                'from': 25,
                'to': 50
            },
            {
                'from': 51,
                'to': 100
            },
            {
                'from': 101,
                'to': 200
            },
            {
                'from': 200,
                'to': 10000
            }
        ]
    );
}
