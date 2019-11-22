/**
 * 总体分析
 */

import chanceChart from '../../charts/chance';
import {CHANCE_MENUS} from '../../consts';

module.exports = {
    title: CHANCE_MENUS.OVERALL.name,
    key: CHANCE_MENUS.OVERALL.key,
    privileges: [
        'CURTAO_CRM_LEAD_QUERY_SELF',
        'CURTAO_CRM_LEAD_QUERY_ALL',
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
