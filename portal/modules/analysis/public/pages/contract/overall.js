/**
 * 总体分析
 */

import { contractChart } from 'ant-chart-collection';
import { isSales, isSelectedAllTeamMember, isAdminOrOpStaff } from '../../utils';


module.exports = {
    title: '总体分析',
    menuIndex: 1,
    privileges: [
        'OPLATE_CONTRACT_ANALYSIS',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //完成情况统计
        //        contractChart.getContractPerformanceChart(),
        //合同分析统计表
        contractChart.getContractChart(),
        //合同产品分布
        contractChart.getContractProductChart(),
        //行业分布
        contractChart.getContractIndustryChart(),
        //地域分布
        contractChart.getContractZoneChart(),
        //团队分布及完成率
        contractChart.getContractTeamChart({
            noShowCondition: {
                callback: () => isSales()
            }
        }),
        //年经常性收入情况
        contractChart.getContractArrChart({
            noShowCondition: {
                callback: () => {
                    //在当前登录用户不是管理员或运营人员或当前选择的不是全部团队或销售时，不显示此图
                    return !isAdminOrOpStaff() || !isSelectedAllTeamMember();
                }
            }
        }),
        //签单情况统计表
        contractChart.getSingingChart(),
    ];
}
