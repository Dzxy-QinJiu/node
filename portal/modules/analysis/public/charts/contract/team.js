/**
 * 团队分布
 */

import { isSales } from '../../consts';

export function getContractTeamChart() {
    return {
        title: '团队分布',
        chartType: 'bar',
        noShowCondition: {
            callback: () => isSales
        },
        url: '/rest/analysis/contract/contract/:data_type/gross/profit/team',
        conditions: [{
            name: 'contract_type',
            value: 'total'
        }],
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
                
                if (query.team_ids) {
                    query.team_id = query.team_ids;
                    delete query.team_ids;
                }
            }
        },
    };
}
