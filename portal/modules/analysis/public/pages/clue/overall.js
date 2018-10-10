/**
 * 总体分析
 */

import clueChart from '../../charts/clue';

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
        //阶段统计
        clueChart.getStageChart(),
        //渠道统计
        clueChart.getChannelChart(),
        //来源统计
        clueChart.getSourceChart(),
        //分类统计
        clueChart.getClassifyChart(),
        //有效性统计
        clueChart.getAvailabilityChart(),
        //成交额及成交数统计
        clueChart.getClueDealChart(),
        //成交数渠道分布
        clueChart.getClueDealChannelChart(),
        //成交数分类分布
        clueChart.getClueDealClassifyChart(),
    ];
}
