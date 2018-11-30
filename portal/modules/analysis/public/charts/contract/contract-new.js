/**
 * 团队或个人统计
 */

export function getContractNewChart() {
    return {
        title: '团队或个人统计',
        chartType: 'bar',
        url: '/rest/analysis/contract/contract/:data_type/gross/profit/team',
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
