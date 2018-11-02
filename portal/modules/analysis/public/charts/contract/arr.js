/**
 * 年经常性收入情况
 */

export function getContractArrChart() {
    return {
        title: '年经常性收入情况(假数据)',
        url: '/rest/analysis/contract_v2/statistics',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
            }
        },
        chartType: 'table',
        option: {
            columns: [
                {
                    title: Intl.get('common.type', '类型'),
                    dataIndex: 'name',
                }, {
                    title: Intl.get('sales.home.total.compute', '总计'),
                    dataIndex: 'amount',
                }, {
                    title: Intl.get('sales.home.new.add', '新增'),
                    dataIndex: 'new',
                }, {
                    title: Intl.get('contract.163', '续约'),
                    dataIndex: 'renewal',
                },{
                    title: Intl.get('contract.171', '流失'),
                    dataIndex: 'runOff',
                }, {
                    title: Intl.get('contract.172', '流失率'),
                    dataIndex: 'churnRate',
                }, {
                    title: Intl.get('contract.173', '年度流失率'),
                    dataIndex: 'yearRate',
                }
            ],
        },
    };
}
