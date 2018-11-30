/**
 * 回款同期对比
 */

import { argCallbackTeamId } from '../../utils';

export function getContractRepayCompareChart() {
    return {
        title: '回款同期对比',
        chartType: 'bar',
        url: '/rest/analysis/contract/contract/:data_type/repay/trend',
        argCallback: argCallbackTeamId,
    };
}
