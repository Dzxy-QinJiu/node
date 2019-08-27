/**
 * 新增过期用户分析
 */

import accountChart from '../../charts/account';
import {ACCOUNT_MENUS} from '../../consts';

module.exports = {
    title: ACCOUNT_MENUS.NEW_ADD_EXPIRE.name,
    key: ACCOUNT_MENUS.NEW_ADD_EXPIRE.key,
    menuIndex: 4,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //新增过期用户数统计
        accountChart.getAccountNumChart('added_expired', Intl.get('user.statistics.expire.new','新增过期用户数统计')),
        //新增过期用户团队统计
        accountChart.getAccountTeamChart('added_expired', Intl.get('user.statistics.expire.new.team','新增过期用户团队分布统计')),
        //地域统计
        accountChart.getAccountZoneChart('added_expired', Intl.get('user.statistics.expire.new.area','新增过期用户地域统计')),
        //行业统计
        accountChart.getAccountIndustryChart('added_expired', Intl.get('user.statistics.expire.new.industry','新增过期用户行业统计')),
        //用户类型
        accountChart.getAccountTypeChart('added_expired'),
        //状态统计
        accountChart.getAccountStatusChart('added_expired'),
    ];
}
