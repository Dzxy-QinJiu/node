/**
 * 签约账号分析
 */

import accountChart from '../../charts/account';
import {ACCOUNT_MENUS} from '../../consts';

module.exports = {
    title: ACCOUNT_MENUS.SIGNED.name,
    key: ACCOUNT_MENUS.SIGNED.key,
    menuIndex: 2,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //单应用帐号活跃度趋势
        accountChart.getActivityChart('signed'),
    ];
}
