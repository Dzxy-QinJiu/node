/**
 * 销售行为统计
 */

import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {listPanelEmitter, phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import { argCallbackMemberIdToMemberIds } from '../../utils';
let conditionCache = {};

export function getSalesBehaviorVisitCustomerChart(paramObj = {}) {
    let chart = {
        title: Intl.get('common.sales.behavior.statistics', '销售行为统计'),
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
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: '10%',
            }, {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'nick_name',
                width: '10%',
            }, {
                title: Intl.get('common.number.of.customers.visited', '拜访客户数'),
                dataIndex: 'visit',
                width: '10%',
                render: (value, record) => {
                    return <span style={{cursor: 'pointer'}} onClick={visitedCustomerNumClickHandler.bind(null, record.user_id)}>{value}</span>;
                }
            }, {
                title: Intl.get('common.number.of.customers.contacted', '联系客户数'),
                dataIndex: 'phone_all',
                width: '10%',
            }, {
                title: Intl.get('common.number.of.calls.made', '接通数'),
                dataIndex: 'phone_answer',
                width: '10%',
            }, {
                title: Intl.get('common.number.of.calls.not.connected', '未接通数'),
                dataIndex: 'phone_no_answer',
                width: '10%',
            }]
        },
    };

    // 没有开通呼叫中心时，去掉接通数(phone_answer)，未接通数(phone_no_answer)这两列
    if(!commonMethodUtil.isOpenCaller()) {
        chart.option.columns = _.filter(columns, column => {
            return !_.includes(['phone_answer','phone_no_answer'], column.dataIndex);
        });
    }

    if (paramObj.chartProps) {
        chart = {...chart, ...paramObj.chartProps};
    }

    function timeRender(value) {
        return moment(value).format(oplateConsts.DATE_TIME_FORMAT);
    }

    //销售行为统计拜访客户数点击处理函数
    function visitedCustomerNumClickHandler(id, e) {
        Trace.traceEvent(e, '点击销售个人报告页面上的销售行为统计拜访客户数查看详细列表');

        conditionCache.member_id = id;

        const conditions = _.map(conditionCache, (value, key) => ({name: key, value}));

        const paramObj = {
            listType: 'customer',
            url: '/rest/analysis/callrecord/v1/customertrace/sale/visit/statistics',
            conditions,
            columns: [
                {
                    title: Intl.get('crm.41', '客户名'),
                    dataIndex: 'customer_name',
                    width: '10%'
                },
                {
                    title: Intl.get('common.visit.start.time', '拜访开始时间'),
                    dataIndex: 'visit_start_time',
                    render: timeRender,
                    width: '10%'
                },
                {
                    title: Intl.get('common.visit.end.time', '拜访结束时间'),
                    dataIndex: 'visit_end_time',
                    render: timeRender,
                    width: '10%'
                },
                {
                    title: Intl.get('common.customer.visit.target', '拜访目标'),
                    dataIndex: 'remark',
                    width: '10%'
                },
                {
                    title: Intl.get('common.customer.visit.record', '拜访记录'),
                    dataIndex: 'trace_remark',
                    width: '10%'
                }
            ],
            onRowClick: record => {
                phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                    customer_params: {
                        currentId: record.id 
                    }
                });
            }
        };

        listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
    }

    return chart;
}
