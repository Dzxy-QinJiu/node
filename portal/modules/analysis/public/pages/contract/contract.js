/**
 * 新增合同分析
 */

import contractChart from '../../charts/contract';

module.exports = {
    title: '新增合同分析',
    menuIndex: 2,
    privileges: [
        'OPLATE_CONTRACT_ANALYSIS',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增合同毛利团队分布
        contractChart.getContractNewChart(),
        //近3个月新增合同周趋势图
        contractChart.getContractTrendChart(),
        //合同额分段统计
        contractChart.getContractSectionChart(),
        /*
        //成交周期分析
        contractChart.getContractCycleChart(),
        */
    ];
}
