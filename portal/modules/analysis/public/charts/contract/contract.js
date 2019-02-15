/**
 * 合同分析统计表
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getContractChart() {
    return {
        title: Intl.get('contract.168', '合同分析统计表') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/contract_v2/statistics',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
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
