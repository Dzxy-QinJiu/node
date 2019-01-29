/**
 * 合同产品分布
 */

import { argCallbackTeamId } from '../../utils';

export function getContractProductChart() {
    return {
        title: '合同产品分布',
        chartType: 'table',
        url: '/rest/analysis/contract/contract/:data_type/product',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
                
            }

            argCallbackTeamId(arg);
        },
        option: {
            columns: [
                {
                    title: '名称',
                    dataIndex: 'name',
                    width: '33%'
                }, {
                    title: '个数',
                    dataIndex: 'count',
                    width: '33%'
                }, {
                    title: '毛利',
                    dataIndex: 'gross_profit',
                    width: '33%'
                }
            ],
        },
    };
}
