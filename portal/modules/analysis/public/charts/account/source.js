/**
 * 账号来源分类统计
 */

import { ifNotSingleApp } from '../../utils';

export function getAccountSourceChart(type = 'total', title = '') {
    return {
        title,
        url: `/rest/analysis/user/v3/:data_type/${type}/source`,
        chartType: 'pie',
        noShowCondition: {
            callback: ifNotSingleApp
        },
        processData: data => {
            return [{
                name: Intl.get('common.clue.convert', '线索转化'),
                value: data.lead,
            }, {
                name: Intl.get('common.sales.develop', '销售开发'),
                value: data.sales,
            }, {
                name: Intl.get('crm.186', '其他'),
                value: data.other,
            }];
        },
    };
}
