/**
 * 线索成交额及成交数统计
 */

export function getClueDealChart() {
    return {
        title: '线索成交额及成交数统计',
        chartType: 'line',
        url: '/rest/analysis/customer/v2/clue/:data_type/sign/contract/amount',
    };
}
