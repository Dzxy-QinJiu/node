/**
 * 地域分布
 */

export function getContractZoneChart() {
    return {
        title: '地域分布',
        chartType: 'table',
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
        option: {
            columns: [
                {
                    title: '名称',
                    dataIndex: 'name',
                    width: '50%'
                }, {
                    title: '毛利',
                    dataIndex: 'value',
                    width: '50%'
                }
            ],
        },
    };
}
