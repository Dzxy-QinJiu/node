/**
 * 账号来源分类统计
 */

import { ifNotSingleApp, argCallbackMemberIdToIds } from '../../utils';

export function getAccountSourceChart(type = 'total', title = '') {
    return {
        title,
        url: `/rest/analysis/user/v3/:data_type/${type}/source`,
        chartType: 'pie',
        noShowCondition: {
            callback: ifNotSingleApp
        },
        argCallback: argCallbackMemberIdToIds,
        processData: data => {
            return [{
                name: '线索转化',
                value: data.lead,
            }, {
                name: '销售开发',
                value: data.sales,
            }];
        },
    };
}
