/**
 * 新开客户分析
 */

import { argCallbackUnderlineTimeToTime } from '../../utils';
import customerChart from '../../charts/customer';
import {CUSTOMER_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

module.exports = {
    title: CUSTOMER_MENUS.NEW_ADD.name,
    key: CUSTOMER_MENUS.NEW_ADD.key,
    menuIndex: 4,
    privileges: [
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF,
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL,
    ],
    charts: getCharts({
        type: 'added',
        argCallback: argCallbackUnderlineTimeToTime
    })
};

function getCharts(paramObj) {
    return [
        //新增趋势
        customerChart.getCustomerTrendChart(paramObj),
        //客户阶段统计
        customerChart.getCustomerNewAddStageChart(paramObj),
        //团队统计
        customerChart.getCustomerTeamChart(paramObj),
        //地域统计
        customerChart.getCustomerZoneChart(paramObj),
        //行业统计
        customerChart.getCustomerIndustryChart(paramObj),
        //新开客户转化率统计
        customerChart.getNewCustomerConvertRateChart(paramObj),
        //销售新开客户数统计
        customerChart.getSalesNewOpenChart(paramObj),
    ];
}
