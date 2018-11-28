/**
 * 合同产品分布
 */

export function getContractProductChart() {
    return {
        title: '合同产品分布',
        chartType: 'table',
        url: '/rest/analysis/contract/contract/:data_type/product',
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
                }, {
                    title: '个数',
                    dataIndex: 'count',
                }, {
                    title: '毛利',
                    dataIndex: 'gross_profit',
                }
            ],
        },
    };
}
