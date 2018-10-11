/**
 * 总体分析
 */

import contractChart from '../../charts/contract';

module.exports = {
    title: '总体分析',
    menuIndex: 1,
    privileges: [
        'OPLATE_CONTRACT_ANALYSIS',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //完成情况统计
        contractChart.getContractPerformanceChart(),
        //合同分析统计表
        contractChart.getContractChart(),
        //合同产品分布
        contractChart.getContractProductChart(),
        //行业分布
        contractChart.getContractIndustryChart(),
        //地域分布
        contractChart.getContractZoneChart(),
        //签单情况统计表
        contractChart.getSingingChart(),
        //业绩同比增长情况
        contractChart.getContractGrowthChart(),
        //年经常性收入情况
        contractChart.getContractArrChart(),
    ];
}
