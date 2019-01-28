/**
 * 用户在线时间
 */

import { getRangeReqData, ifNotSingleApp, argCallbackTeamId, argCallbackMemberIdToSalesId } from '../../utils';

export function getLoginTimesChart() {
    return {
        title: Intl.get('oplate.user.analysis.loginTimes', '用户在线时间'),
        url: '/rest/analysis/user/v3/:auth_type/online_time/distribution/num',
        argCallback: arg => {
            argCallbackTeamId(arg);
            argCallbackMemberIdToSalesId(arg);
        },
        reqType: 'post',
        conditions: [{
            value: getOnlineTimeReqData(),
            type: 'data',
        }],
        chartType: 'wordcloud',
        unit: Intl.get('common.label.hours', '小时'),
        multiple: 60,
        csvOption: {
            thead: [Intl.get('oplate.user.analysis.loginTimes', '用户在线时间'), Intl.get('common.app.count', '数量')],
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}

function getOnlineTimeReqData() {
    return getRangeReqData(
        [
            {
                'from': 0,
                'to': 1
            },
            {
                'from': 1,
                'to': 5
            },
            {
                'from': 5,
                'to': 10
            },
            {
                'from': 10,
                'to': 10000
            }
        ]
        , 60
    );
}
