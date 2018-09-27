/**
 * 新开试用客户分析
 */

import customerChart from '../../charts/customer';
import { unknownDataMap } from '../../consts';
const getDataAuthType = require('CMP_DIR/privilege/checker').getDataAuthType;

module.exports = {
    title: '新开试用客户分析',
    menuIndex: 7,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [{
        title: Intl.get('customer.analysis.add.trend', '新增趋势'),
        url: (() => {
            let url = '/rest/analysis/customer/v2/:auth_type/added/trend';

            if (getDataAuthType().toLowerCase() === 'common') {
                url = '/rest/analysis/customer/v2/added/trend';
            }

            return url;
        })(),
        chartType: 'line',
        dataField: '[0].data',
    }, {
        title: Intl.get('user.analysis.team.add', '团队-新增'),
        url: '/rest/analysis/customer/v2/:auth_type/added/team',
        chartType: 'bar',
        customOption: {
            showValue: true,
        },
        nameValueMap: unknownDataMap,
    }, {
        title: Intl.get('user.analysis.location.add', '地域-新增'),
        url: '/rest/analysis/customer/v2/:auth_type/added/zone',
        chartType: 'bar',
        customOption: {
            showValue: true,
        },
        nameValueMap: unknownDataMap,
    }, {
        title: Intl.get('user.analysis.industry.add', '行业-新增'),
        url: '/rest/analysis/customer/v2/:auth_type/added/industry',
        chartType: 'bar',
        customOption: {
            reverse: true,
            showValue: true,
        },
        nameValueMap: unknownDataMap,
    },
    
        //销售新开客户数统计
    customerChart.getSalesNewOpenChart(),
    ];
}
