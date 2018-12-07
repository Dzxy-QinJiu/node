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
        //团队或成员新机会统计
        chanceChart.getNewChanceChart(),
        //团队或成员所有机会统计
        chanceChart.getAllChanceChart(),
        //成交率趋势统计
        chanceChart.getChanceDealChart(),
    ];
}
