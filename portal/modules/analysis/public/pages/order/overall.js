/**
 * 总体分析
 */

import orderChart from '../../charts/order';
import {ORDER_MENUS} from '../../consts';

module.exports = {
    title: ORDER_MENUS.OVERALL.name,
    key: ORDER_MENUS.OVERALL.key,
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
        orderChart.getOrderStageChart({
            layout: {sm: 24},
        }),
        //订单成交率趋势
        orderChart.getOrderTurnoverRateTrendChart(),
    ];
}

//调整日期选择器
function adjustDatePicker(option) {
    //隐藏日期选择器
    option.className += ' hide';
}
