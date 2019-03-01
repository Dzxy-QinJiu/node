/**
 * 团队或个人回款毛利统计
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';
import { num as antUtilNum } from 'ant-utils';

export function getRepayChart() {
    return {
        title: '团队或个人回款毛利统计' + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
        chartType: 'bar',
        url: '/rest/analysis/contract/contract/repay/team/amount',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
        processData: data => {
            return _.map(data, item => {
                //将数据中的值转成以万为单位的
                item.value = antUtilNum.formatAmount(item.value);

                return item;
            });
        }
    };
}
