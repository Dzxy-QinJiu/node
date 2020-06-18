/**
 * 客户阶段统计
 */

export function getCallCustomerStageChart() {
    return {
        title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
        chartType: 'pie',
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/bakup/data/distribution/customer_label',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: false, 
        }],
        dataField: 'customer_label_sum',
    };
}
