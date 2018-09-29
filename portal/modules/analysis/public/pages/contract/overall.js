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
        //合同分析统计表
        contractChart.getContractChart(),
        //签单情况统计表
        contractChart.getSingingChart(),
    ];
}
