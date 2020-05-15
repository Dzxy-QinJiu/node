/**
 * 客户活跃度分析
 */

import customerChart from '../../charts/customer';
import {CUSTOMER_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
module.exports = {
    title: CUSTOMER_MENUS.ACTIVE.name,
    key: CUSTOMER_MENUS.ACTIVE.key,
    menuIndex: 2,
    privileges: [
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF,
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL,
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //近一月活跃客户日活趋势
        customerChart.getCustomerActiveTrendChart(Intl.get('common.recent.month.daily.activity', '近一个月日活'), 'day'),
        //近一季度活跃客户周活趋势
        customerChart.getCustomerActiveTrendChart(Intl.get('common.recent.three.month.weekly.activity', '近三个月周活'), 'week'),
        //近一年活跃客户月活趋势
        customerChart.getCustomerActiveTrendChart(Intl.get('common.recent.year.monthly.activity', '近一年月活'), 'month'),
        //有效客户活跃率统计
        customerChart.getCustomerEffectiveChart(),
        //各阶段活跃客户统计
        customerChart.getStageActiveCustomerChart(),
    ];
}
