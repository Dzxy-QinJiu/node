/**
 * 其他
 */

import customerChart from '../../charts/customer';
import {CUSTOMER_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

module.exports = {
    title: CUSTOMER_MENUS.OTHER.name,
    key: CUSTOMER_MENUS.OTHER.key,
    menuIndex: 7,
    privileges: [
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL,
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF,
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //转出客户数趋势
        customerChart.getCustomerTransferTrendChart(),
        //转出客户明细
        customerChart.getCustomerTransferChart(),
        //客户阶段变更统计
        customerChart.getCustomerStageChangeChart(),
        //成交分析
        customerChart.getCustomerDealChart(),
    ];
}
