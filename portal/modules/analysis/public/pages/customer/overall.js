/**
 * 总体分析
 */

import { argCallbackUnderlineTimeToTime } from '../../utils';
import customerChart from '../../charts/customer';
import {CUSTOMER_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

module.exports = {
    title: CUSTOMER_MENUS.OVERALL.name,
    key: CUSTOMER_MENUS.OVERALL.key,
    menuIndex: 1,
    privileges: [
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF,
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL,
    ],
    charts: getCharts({
        type: 'total',
        argCallback: argCallbackUnderlineTimeToTime
    })
};

function getCharts(paramObj) {
    return [
        //趋势统计
        customerChart.getCustomerTrendChart(paramObj),
        //客户阶段统计
        customerChart.getCustomerStageChart(paramObj),
        //地域统计
        customerChart.getCustomerZoneChart(paramObj),
        //行业统计
        customerChart.getCustomerIndustryChart(paramObj),
        //团队统计
        customerChart.getCustomerTeamChart(paramObj),
        //客户覆盖率统计
        customerChart.getCustomerCoverageChart(),
    ];
}
