/**
 * 新增合同分析
 */

import contractChart from '../../charts/contract';

module.exports = {
    title: '新增合同分析',
    menuIndex: 2,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增合同毛利团队分布
        contractChart.getContractNewChart(),
    ];
}
