/**
 * 客户阶段统计
 */

export function getCallCustomerStageChart() {
    return {
        title: '客户阶段统计',
        chartType: 'pie',
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/distribution/customer_label',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: false, 
        }, {
            name: 'device_type',
            value: 'all'
        }],
        dataField: 'customer_label_sum',
    };
}
