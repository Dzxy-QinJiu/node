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
        clueChart.getClueSituationChart({title: '渠道统计', field: 'access_channel'}),
        //来源统计
        clueChart.getClueSituationChart({title: '来源统计', field: 'clue_source'}),
        //分类统计
        clueChart.getClueSituationChart({title: '分类统计', field: 'clue_classify'}),
        //有效性统计
        clueChart.getAvailabilityChart(),
        //成交额及成交数统计
        clueChart.getClueDealChart(),
        //成交数渠道统计
        clueChart.getClueDealChannelChart(),
        //成交数分类统计
        clueChart.getClueDealClassifyChart(),
        //历史同期数量统计对比
        clueChart.getClueHistoricalPeriodComparisionChart(),
    ];
}
