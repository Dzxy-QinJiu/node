/**
 * 试用合格客户地域、行业分析
 */

import { argCallbackTimeMember } from '../../utils';

export function getCustomerTrialQualifiedDistributionChart(title, field) {
    return {
        title,
        chartType: 'table',
        url: '/rest/analysis/customer/v2/:data_type/accounts/login/qualify/statistic',
        conditions: [{
            name: 'customer_label',
            value: '试用',
        }, {
            name: 'statistics_type',
            value: field
        }],
        argCallback: argCallbackTimeMember,
        dataField: 'result',
        option: {
            columns: [{
                title: '名称',
                dataIndex: 'name',
                width: '50%',
            }, {
                title: '数量',
                dataIndex: 'num',
                width: '50%',
            }],
        }
    };
}
