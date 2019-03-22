/**
 * 回款分析
 */

import { contractChart } from 'ant-chart-collection';

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
        //类型分析
        //        contractChart.getContractRepayTypeChart(),
        //团队或个人回款毛利统计
        contractChart.getRepayChart(),
        //近3个月回款周趋势图
        contractChart.getRepayTrendChart(),
        //业绩同比增长情况
        contractChart.getContractGrowthChart(),
        //回款同期对比
        contractChart.getContractRepayCompareChart(),
    ];
}
