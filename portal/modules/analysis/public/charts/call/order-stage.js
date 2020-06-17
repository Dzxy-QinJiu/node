/**
 * 订单阶段统计
 */

export function getCallOrderStageChart() {
    return {
        title: Intl.get('oplate_customer_analysis.11', '订单阶段统计'),
        chartType: 'pie',
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/bakup/data/distribution/sales_stage',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: false, 
        }],
        dataField: 'opp_stage_sum',
    };
}
