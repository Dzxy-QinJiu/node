/**
 * 回款分析
 */

import { contractChart } from 'ant-chart-collection';
import {CONTRACT_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
module.exports = {
    title: CONTRACT_MENUS.REPAY.name,
    key: CONTRACT_MENUS.REPAY.key,
    menuIndex: 3,
    privileges: [
        analysisPrivilegeConst.CRM_CONTRACT_ANALYSIS,
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //类型分析
        //        contractChart.getContractRepayTypeChart(),
        //团队或个人回款毛利统计
        contractChart.getRepayChart(),
        //近3个月回款毛利周趋势图
        contractChart.getTrendChart({
            title: Intl.get('contract.146', '近3个月回款毛利周趋势图'),
            type: 'repay'
        }),
        //业绩同比增长情况
        contractChart.getContractGrowthChart(),
        //回款同期对比
        contractChart.getContractRepayCompareChart(),
    ];
}
