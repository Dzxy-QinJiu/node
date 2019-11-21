/**
 * 费用分析
 */

import { contractChart } from 'ant-chart-collection';
import {CONTRACT_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
module.exports = {
    title: CONTRACT_MENUS.COST.name,
    key: CONTRACT_MENUS.COST.key,
    menuIndex: 4,
    privileges: [
        analysisPrivilegeConst.CRM_CONTRACT_ANALYSIS,
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增费用额团队分布
        contractChart.getCostChart(),
        //近3个月费用周趋势图
        contractChart.getTrendChart({
            title: Intl.get('contract.150', '近3个月费用周趋势图'),
            type: 'cost'
        }),
    ];
}
