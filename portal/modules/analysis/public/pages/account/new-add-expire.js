/**
 * 新增过期账号分析
 */

import accountChart from '../../charts/account';

module.exports = {
    title: '新增过期账号分析',
    menuIndex: 4,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增过期账号数统计
        accountChart.getAccountNumChart('added_expired', '新增过期账号数统计'),
        //新增过期帐号团队统计
        accountChart.getAccountTeamChart('added_expired', '新增过期帐号团队统计'),
        //地域统计
        accountChart.getAccountZoneChart('added_expired'),
        //行业统计
        accountChart.getAccountIndustryChart('added_expired'),
        //账号类型
        accountChart.getAccountTypeChart('added_expired'),
        //状态统计
        accountChart.getAccountStatusChart('added_expired'),
    ];
}
