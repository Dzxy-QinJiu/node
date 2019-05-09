/**
 * 销售行为统计
 */

import { argCallbackMemberIdToMemberIds } from '../../utils';

export function getSalesBehaviorVisitCustomerChart(paramObj = {}) {
    return {
        title: Intl.get('common.sales.behavior.statistics', '销售行为统计'),
        chartType: 'table',
        url: '/rest/analysis/callrecord/v1/customertrace/:data_type/sale/trace/statistics',
        argCallback: arg => {
            argCallbackMemberIdToMemberIds(arg);
            if (arg.query.member_ids) {
                arg.query.result_type = 'user';
            }
        },
        processData: data => {
            const list = _.get(data, 'list');
            return _.map(list, item => {
                ['visit', 'phone_all', 'phone_answer'].forEach(field => {
                    if (isNaN(item[field])) item[field] = 0;
                });

                item.phone_no_answer = item.phone_all - item.phone_answer;

                return item;
            });
        },
        option: {
            columns: [{
                title: Intl.get('common.number.of.customers.visited': '拜访客户数'),
                dataIndex: 'visit',
                width: '25%',
                render: value => {
                    if (_.isFunction(paramObj.visitedCustomerNumClickHandler)) {
                        return <span style={{cursor: 'pointer'}} onClick={paramObj.visitedCustomerNumClickHandler}>{value}</span>;
                    } else {
                        return <span>{value}</span>;
                    }
                }
            }, {
                title: Intl.get('common.number.of.customers.contacted', '联系客户数'),
                dataIndex: 'phone_all',
                width: '25%',
            }, {
                title: Intl.get('common.number.of.calls.made', '接通数'),
                dataIndex: 'phone_answer',
                width: '25%',
            }, {
                title: Intl.get('common.number.of.calls.not.connected', '未接通数'),
                dataIndex: 'phone_no_answer',
                width: '25%',
            }]
        },
    };
}
