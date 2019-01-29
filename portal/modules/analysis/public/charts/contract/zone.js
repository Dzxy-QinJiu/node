/**
 * 地域分布
 */

import { argCallbackTeamId } from '../../utils';

export function getContractZoneChart() {
    return {
        title: '地域分布',
        chartType: 'bar',
        option: {
            grid: {
                left: 80,
            },
        },
        url: '/rest/analysis/contract/contract/:data_type/region',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
            }

            argCallbackTeamId(arg);
        },
    };
}
