/**
 * 成交数分类统计
 */

import { initialTime } from '../../consts';

export function getClueDealClassifyChart() {
    return {
        title: '成交数分类统计',
        chartType: 'bar_pie',
        url: '/rest/analysis/customer/v2/clue/:data_type/statistical/field/clue_classify',
        conditions: [{
            name: 'customer_label',
            value: '签约',
        }],
        dataField: 'result',
        processData: data => {
            return _.map(data, dataItem => {
                let processedItem = {};
                _.each(dataItem, (value, key) => {
                    processedItem.name = key || '未知';
                    processedItem.value = value;
                });

                return processedItem;
            });
        },
    };
}
