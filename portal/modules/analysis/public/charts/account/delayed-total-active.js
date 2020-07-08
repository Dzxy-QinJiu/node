/**
 * 登录用户统计
 */

import { MERIDIEM } from 'PUB_DIR/sources/utils/consts';

export function getDelayedTotalActiveChart() {
    return {
        title: Intl.get('analysis.login.user.statistics', '登录用户统计'),
        chartType: 'table',
        url: '/rest/analysis/user/v3/:data_type/delay/user/team',
        option: {
            columns: [{
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: 100,
            }, {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'member_name',
                width: 100,
            }, {
                title: Intl.get('analysis.the.total.number.of.delay', '延期总数'),
                dataIndex: 'total',
                width: 100,
            }, {
                title: Intl.get('operation.report.active.num', '活跃数'),
                dataIndex: 'active',
                width: 100,
            }],
        }
    };
}
