/**
 * 年经常性收入情况
 */

export function getContractArrChart() {
    return {
        title: '年经常性收入情况',
        chartType: 'line',
        option: {
            grid: {
                left: 100,
            },
        },
        url: '/rest/analysis/contract/contract/:data_type/income',
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
