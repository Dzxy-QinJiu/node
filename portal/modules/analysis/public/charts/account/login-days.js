/**
 * 用户访问天数
 */

import { getRangeReqData, ifNotSingleApp, argCallbackTeamId, argCallbackMemberIdToSalesId } from '../../utils';

export function getLoginDaysChart() {
    return {
        title: Intl.get('oplate.user.analysis.loginDays', '用户访问天数'),
        url: '/rest/analysis/user/v3/:auth_type/login/day/distribution/num',
        argCallback: arg => {
            argCallbackTeamId(arg);
            argCallbackMemberIdToSalesId(arg);
        },
        reqType: 'post',
        conditions: [{
            value: getLoginDayNumReqData(),
            type: 'data',
        }],
        chartType: 'wordcloud',
        unit: Intl.get('common.time.unit.day', '天'),
        csvOption: {
            thead: [Intl.get('oplate.user.analysis.loginDays', '用户访问天数'), Intl.get('common.app.count', '数量')],
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}

function getLoginDayNumReqData() {
    return getRangeReqData(
        [
            [1, 2, 3, 4],
            {
                'from': 5,
                'to': 10
            },
            {
                'from': 11,
                'to': 15
            },
            {
                'from': 16,
                'to': 20
            },
            {
                'from': 21,
                'to': 50
            },
            {
                'from': 51,
                'to': 100
            },
            {
                'from': 100,
                'to': 10000
            }
        ]
    );
}
