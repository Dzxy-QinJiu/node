/**
 * 行业分布
 */

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
                
                if (query.team_ids) {
                    query.team_id = query.team_ids;
                    delete query.team_ids;
                }
            }
        },
    };
}
