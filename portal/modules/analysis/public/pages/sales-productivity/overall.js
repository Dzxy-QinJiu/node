/**
 * 总体分析
 */

import salesProductivityChart from '../../charts/sales-productivity';

module.exports = {
    title: Intl.get('common.overall.analysis', '总体分析'),
    menuIndex: 1,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    adjustDatePicker,
    adjustInterval,
    charts: getCharts()
};

function getCharts() {
    return [
        //销售经理业绩排名
        salesProductivityChart.getSalesManagerPerformanceRankingChart()
    ];
}

//调整日期选择器
function adjustDatePicker(option) {
    //该页上的日期选择器不允许选择天和自定义
    option.periodOptions = _.filter(option.periodOptions, item => !_.includes(['day', 'custom'], item.value));
}

//调整时间区间参数
function adjustInterval(range) {
    //该页上的时间区间参数和日期选择器上选择的时间区间一致
    return range;
}
