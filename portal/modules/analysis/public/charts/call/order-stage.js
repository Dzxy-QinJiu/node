/**
 * 订单阶段统计
 */

export function getCallOrderStageChart() {
    return {
        title: '订单阶段统计',
        chartType: 'pie',
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/distribution/sales_stage',
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
        dataField: 'opp_stage_sum',
    };
}
