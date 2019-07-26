/**
 * 其他
 */

import customerChart from '../../charts/customer';
import {CUSTOMER_MENUS} from '../../consts';

module.exports = {
    title: CUSTOMER_MENUS.OTHER.name,
    key: CUSTOMER_MENUS.OTHER.key,
    menuIndex: 7,
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
        //转出客户明细
        customerChart.getCustomerTransferChart(),
        //客户阶段变更统计
        customerChart.getCustomerStageChangeChart(),
        //成交分析
        customerChart.getCustomerDealChart(),
    ];
}
