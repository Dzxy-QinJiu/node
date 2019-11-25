/**
 * 拜访客户统计
 */

import { argCallbackMemberIdToMemberIds } from '../../utils';
let conditionCache = {};

export function getVisitCustomerChart() {
    let chart = {
        title: Intl.get('common.sales.behavior.statistics', '拜访客户统计'),
        chartType: 'table',
        url: '/rest/analysis/callrecord/v1/customertrace/:data_type/sale/trace/statistics',
        argCallback: arg => {
            argCallbackMemberIdToMemberIds(arg);
            arg.query.result_type = 'user';

            conditionCache = arg.query;
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
                title: '日期',
                dataIndex: 'sales_team',
                width: '10%',
            }, {
                title: '出差人员',
                dataIndex: 'nick_name',
                width: '10%',
                render: value => {
                    return <span onClick={onSalesNameClick}>{value}</span>;
                }
            }]
        },
    };

    //销售人员名点击事件
    function onSalesNameClick(id, e) {
        console.log(1);
        conditionCache.member_id = id;

        const conditions = _.map(conditionCache, (value, key) => ({name: key, value}));

        const paramObj = {
            listType: 'customer',
            url: '/rest/analysis/callrecord/v1/customertrace/sale/visit/statistics',
            conditions,
            columns: [
                {
                    title: '日期',
                    dataIndex: 'customer_name',
                    width: '10%'
                },
                {
                    title: '拜访客户',
                    dataIndex: 'customer_name',
                    width: '10%'
                },
            ],
        };
    }

    return chart;
}
