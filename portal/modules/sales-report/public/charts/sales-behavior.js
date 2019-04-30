/**
 * 销售行为统计
 */

export function getSalesBehaviorChart(paramObj = {}) {
    return {
        title: Intl.get('common.sales.behavior.statistics', '销售行为统计'),
        chartType: 'table',
        url: '/rest/analysis/customer/v2/customertrace/:data_type/sale/trace/statistics',
        argCallback: arg => {
            if (arg.query.member_id) {
                arg.query.member_ids = arg.query.member_id;
                delete arg.query.member_id;
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
                title: '拜访客户数',
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
                title: '联系客户数',
                dataIndex: 'phone_all',
                width: '25%',
            }, {
                title: '接通数',
                dataIndex: 'phone_answer',
                width: '25%',
            }, {
                title: '未接通数',
                dataIndex: 'phone_no_answer',
                width: '25%',
            }]
        },
    };
}
