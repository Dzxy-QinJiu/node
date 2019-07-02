/**
 * 签约客户分析
 */

import { argCallbackUnderlineTimeToTime, argCallbackMemberIdsToMemberId } from '../../utils';
import {CUSTOMER_MENUS} from '../../consts';
import customerChart from '../../charts/customer';

module.exports = {
    title: CUSTOMER_MENUS.SIGNED.name,
    key: CUSTOMER_MENUS.SIGNED.key,
    menuIndex: 3,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts({
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
    })
};

function getCharts(paramObj) {
    return [
        //签约客户总体趋势
        customerChart.getSignedCustomerTotalTrendChart(paramObj),
        //签约客户净增分析
        customerChart.getSignedCustomerNetIncreaseChart(paramObj),
        //签约客户毛利分析
        customerChart.getSignedCustomerGrossProfitChart(paramObj),
        //签约客户行政级别市场占有率分析
        customerChart.getSignedCustomerAdministrativeLevelCoverageChart(paramObj),
        //签约客户地域市场占有率分析
        customerChart.getSignedCustomerZoneCoverageChart(paramObj),
        //签约客户行业分布
        customerChart.getSignedCustomerTotalIndustryChart(paramObj),
        //签约客户团队分布
        customerChart.getSignedCustomerTotalTeamChart(paramObj),
        //新签客户趋势
        customerChart.getSignedCustomerNewTrendChart(paramObj),
        //新签行业分布
        customerChart.getSignedCustomerNewIndustryChart(paramObj),
        //新签团队分布
        customerChart.getSignedCustomerNewTeamChart(paramObj),
        //续签客户趋势
        customerChart.getRenewalCustomerTrendChart(paramObj),
        //续签客户地域统计
        customerChart.getRenewalCustomerZoneChart(paramObj),
        //续签客户毛利统计
        customerChart.getRenewalCustomerGrossProfitChart(paramObj),
        //流失客户趋势统计
        customerChart.getLossCustomerTrendChart(paramObj),
        //现金流失率
        customerChart.getCashLossRateChart(paramObj),
        //流失现金趋势统计
        customerChart.getLossCashTrendChart(paramObj),
        //流失客户地域统计
        customerChart.getLossCustomerZoneChart(paramObj),
        //流失客户团队统计
        customerChart.getLossCustomerTeamChart(paramObj),
        //流失客户总体情况分析
        customerChart.getLossCustomerOverviewChart(paramObj),
        //客户续签时间统计
        customerChart.getRenewalCustomerTimeChart(paramObj),
    ];
}
