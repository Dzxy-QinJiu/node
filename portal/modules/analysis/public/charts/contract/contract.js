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

            const appId = _.get(arg, 'query.app_id');

            //接口不支持用app_id=all来表示全部应用，要查全部应用的话，需要通过不传app_id来实现
            if (appId === 'all') {
                delete arg.query.app_id;
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
