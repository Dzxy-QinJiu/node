/**
 * 阶段变更分析
 */

import customerChart from '../../charts/customer';
import {CUSTOMER_MENUS} from '../../consts';

module.exports = {
    title: CUSTOMER_MENUS.STAGE.name,
    key: CUSTOMER_MENUS.STAGE.key,
    menuIndex: 6,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //转出客户数趋势
        customerChart.getCustomerTransferTrendChart(),
        //转出客户统计
        customerChart.getCustomerTransferChart(),
        //客户阶段变更统计
        customerChart.getCustomerStageChangeChart(),
    ];
}
