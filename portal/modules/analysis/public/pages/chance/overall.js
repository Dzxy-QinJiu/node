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
        //来源统计
        chanceChart.getChanceSourceChart(),
        //团队统计
        chanceChart.getChanceTeamChart(),
    ];
}
