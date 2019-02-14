/**
 * 团队或个人费用统计 
 */

import { processAmountData, argCallbackUnderlineTimeToTime } from '../../utils';

export function getCostChart() {
    return {
        title: '团队或个人费用统计',
        url: '/rest/analysis/contract/contract/cost/team/amount',
        argCallback: argCallbackUnderlineTimeToTime,
        chartType: 'bar',
        processData: processAmountData,
    };
}
