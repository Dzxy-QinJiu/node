/**
 * 总体分析
 */

import chanceChart from '../../charts/chance';
import {CHANCE_MENUS} from '../../consts';
import analysisPrivilegeConst from '../../privilege-const';

module.exports = {
    title: CHANCE_MENUS.OVERALL.name,
    key: CHANCE_MENUS.OVERALL.key,
    privileges: [
        analysisPrivilegeConst.CRM_CUSTOMER_ANALYSIS_SALES_OPPORTUNITY_USER,
        analysisPrivilegeConst.CRM_CUSTOMER_ANALYSIS_SALES_OPPORTUNITY_MANAGER,
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新机会统计
        chanceChart.getNewChanceChart('funnel'),
        //所有机会统计
        chanceChart.getAllChanceChart(),
        //成交率趋势统计
        chanceChart.getChanceDealTrendChart(),
        //销售机会明细
        chanceChart.getChanceDetailChart(),
    ];
}
