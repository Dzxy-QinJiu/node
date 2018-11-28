/**
 * 地域分布
 */

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
                
                if (query.team_ids) {
                    query.team_id = query.team_ids;
                    delete query.team_ids;
                }
            }
        },
    };
}
