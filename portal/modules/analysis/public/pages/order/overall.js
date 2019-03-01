/**
 * 总体分析
 */

import orderChart from '../../charts/order';

module.exports = {
    title: '总体分析',
    menuIndex: 1,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    adjustDatePicker,
    charts: getCharts()
};

function getCharts() {
    return [
        //阶段统计
        orderChart.getOrderStageChart(),
        //订单成交率趋势
        orderChart.getOrderTurnoverRateTrendChart(),
    ];
}

//调整日期选择器
function adjustDatePicker(option) {
    //隐藏日期选择器
    option.className += ' hide';
}
