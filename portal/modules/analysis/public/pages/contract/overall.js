/**
 * 总体分析
 */

import { contractChart } from 'ant-chart-collection';
import { isSales, isSelectedAllTeamMember, isAdminOrOpStaff } from '../../utils';
import {CONTRACT_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
module.exports = {
    title: CONTRACT_MENUS.OVERALL.name,
    key: CONTRACT_MENUS.OVERALL.key,
    menuIndex: 1,
    privileges: [
        analysisPrivilegeConst.CRM_CONTRACT_ANALYSIS,
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //合同到期提醒
        contractChart.getContractExpireRemindChart(),
        //合同分析统计表
        contractChart.getContractChart(),
        //年经常性收入情况
        contractChart.getContractArrChart({
            noShowCondition: {
                callback: () => {
                    //在当前登录用户不是管理员或运营人员或当前选择的不是全部团队或销售时，不显示此图
                    return !isAdminOrOpStaff() || !isSelectedAllTeamMember();
                }
            }
        }),
    ];
}
