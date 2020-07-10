/**
 * 总体分析
 */

import salesProductivityChart from '../../charts/sales-productivity';
import {SALES_PRODUCTIVITY_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

module.exports = {
    title: SALES_PRODUCTIVITY_MENUS.OVERALL.name,
    key: SALES_PRODUCTIVITY_MENUS.OVERALL.key,
    menuIndex: 1,
    privileges: [
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF,
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL,
    ],
    adjustDatePicker,
    adjustInterval,
    charts: getCharts()
};

function getCharts() {
    return [
        //联系客户统计
        salesProductivityChart.getContactChart('customer'),
        //联系线索统计
        salesProductivityChart.getContactChart('lead'),
        //客户经理业绩排名， 由于排名算法有问题，暂时下线
        // salesProductivityChart.getCustomerManagerPerformanceRankingChart(),
        //销售经理业绩排名
        salesProductivityChart.getSalesManagerPerformanceRankingChart(),
        //出差拜访频率统计
        salesProductivityChart.getVisitCustomerChart(),
        //拜访客户趋势统计
        salesProductivityChart.getVisitCustomerTrendChart(),
        //出差统计详情
        salesProductivityChart.getBusinessTripStatisticsDetailChart(),
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
