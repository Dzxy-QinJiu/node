/**
 * 近3个月回款周趋势图
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';
import { num as antUtilNum } from 'ant-utils';

export function getRepayTrendChart() {
    return {
        title: Intl.get('contract.146', '近3个月回款周趋势图') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
        chartType: 'line',
        url: '/rest/analysis/contract/contract/repay/trend',
        argCallback: arg => {
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
            argCallbackUnderlineTimeToTime(arg);

            const query = arg.query;

            if (query) {
                query.starttime = moment().subtract(3, 'month').valueOf();
                query.endtime = moment().valueOf();
            }
        },
        processData: data => {
            return _.map(data, item => {
                item.name = moment(item.timestamp).format(oplateConsts.DATE_FORMAT);
                //将数据中的值转成以万为单位的
                item.value = antUtilNum.formatAmount(item.value);
                return item;
            });
        }
    };
}
