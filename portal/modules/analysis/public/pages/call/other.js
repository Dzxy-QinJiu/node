/**
 * 其他分析
 */

import callChart from '../../charts/call';
import {CALL_MENUS} from '../../consts';

module.exports = {
    title: CALL_MENUS.OTHER.name,
    key: CALL_MENUS.OTHER.key,
    menuIndex: 2,
    privileges: [
        'CUSTOMER_CALLRECORD_STATISTIC_USER',
        'CUSTOMER_CALLRECORD_STATISTIC_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //114占比统计
        callChart.getCall114RatioChart(),
        //客服电话统计
        callChart.getCallServiceTelChart(),
        //通话时段统计
        callChart.getCallTimeIntervalChart(),
        //客户阶段统计
        callChart.getCallCustomerStageChart(),
        //订单阶段统计
        callChart.getCallOrderStageChart(),
        //客户的地域分布
        callChart.getCallCustomerGeographicalDistributionChart(),
    ];
}
