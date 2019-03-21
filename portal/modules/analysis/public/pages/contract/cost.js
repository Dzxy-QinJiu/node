/**
 * 费用分析
 */

import { contractChart } from 'ant-chart-collection';

module.exports = {
    title: '费用分析',
    menuIndex: 4,
    privileges: [
        'OPLATE_CONTRACT_ANALYSIS',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增费用额团队分布
        contractChart.getCostChart(),
        //近3个月费用周趋势图
        contractChart.getCostTrendChart(),
    ];
}
