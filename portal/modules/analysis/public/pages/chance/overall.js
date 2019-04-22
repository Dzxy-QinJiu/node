/**
 * 总体分析
 */

import chanceChart from '../../charts/chance';

module.exports = {
    title: '总体分析',
    privileges: [
        'CRM_CLUE_STATISTICAL_SELF',
        'CRM_CLUE_STATISTICAL_ALL',
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
