/**
 * 行业分布
 */

import { argCallbackTeamId } from '../../utils';

export function getContractIndustryChart() {
    return {
        title: '行业分布',
        chartType: 'bar',
        customOption: {
            reverse: true,
        },
        url: '/rest/analysis/contract/contract/:data_type/industry',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
            }

            argCallbackTeamId(arg);
        },
    };
}
