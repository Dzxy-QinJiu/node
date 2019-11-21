/**
 * 新增合同分析
 */

import { contractChart } from 'ant-chart-collection';
import {CONTRACT_MENUS} from '../../consts';
import { isSales } from '../../utils';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

module.exports = {
    title: CONTRACT_MENUS.CONTRACT.name,
    key: CONTRACT_MENUS.CONTRACT.key,
    menuIndex: 2,
    privileges: [
        analysisPrivilegeConst.CRM_CONTRACT_ANALYSIS,
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增合同毛利团队分布
        contractChart.getContractNewChart(),
        //近3个月新增合同周趋势图
        contractChart.getTrendChart({
            title: Intl.get('contract.147', '近3个月新增合同周趋势图'),
            type: 'count'
        }),
        //合同额分段统计
        contractChart.getContractSectionChart(),
        //合同产品分布
        contractChart.getContractProductChart(),
        //行业分布
        contractChart.getContractIndustryChart(),
        //地域分布
        contractChart.getContractZoneChart(),
        //签单情况统计表
        contractChart.getSingingChart(),
    ];
}
