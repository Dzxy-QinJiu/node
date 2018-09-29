/**
 * 回款分析
 */

import contractChart from '../../charts/contract';

module.exports = {
    title: '回款分析',
    menuIndex: 3,
    privileges: [
        'OPLATE_CONTRACT_ANALYSIS',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增回款额团队分布
        contractChart.getRepayChart(),
        //近3个月回款周趋势图
        contractChart.getRepayTrendChart(),
    ];
}
