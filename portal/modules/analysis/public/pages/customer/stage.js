/**
 * 阶段变更分析
 */

import { initialTime } from '../../consts';

module.exports = {
    title: '阶段变更分析',
    menuIndex: 10,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [{
        title: Intl.get('user.analysis.moveoutCustomer', '转出客户统计'),
        url: '/rest/customer/v2/customer/transfer/record/1000/time/descend',
        reqType: 'post',
        conditions: [{
            type: 'data',
            rangeParamName: 'name',
            value: 'time',
        }, {
            type: 'data',
            rangeParamName: 'type',
            value: 'time',
        }, {
            name: 'starttime',
            value: initialTime.start,
            type: 'data',
            rangeParamName: 'from',
        }, {
            name: 'endtime',
            value: initialTime.end,
            type: 'data',
            rangeParamName: 'to',
        }],
        dataField: 'result',
        chartType: 'table',
        layout: {
            sm: 24,
        },
        option: {
            pagination: false,
            columns: [
                {
                    title: Intl.get('common.login.time', '时间'),
                    dataIndex: 'time',
                    key: 'time',
                    sorter: true,
                    width: 100,
                    align: 'left',
                    render: text => <span>{moment(text).format(oplateConsts.DATE_FORMAT)}</span>,
                }, {
                    title: Intl.get('crm.41', '客户名'),
                    dataIndex: 'customer_name',
                    key: 'customer_name',
                    className: 'customer-name',
                    sorter: true,
                    width: 300,
                    render: (text, item, index) => {
                        return (
                            <span className="transfer-customer-cell"
                            >{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('crm.customer.transfer.sales', '销售代表'),
                    dataIndex: 'old_member_nick_name',
                    key: 'old_member_nick_name',
                    sorter: true,
                    width: 100,
                }, {
                    title: Intl.get('crm.customer.transfer.manager', '客户经理'),
                    dataIndex: 'new_member_nick_name',
                    key: 'new_member_nick_name',
                    sorter: true,
                    width: 100,
                }, {
                    title: Intl.get('user.sales.team', '销售团队'),
                    dataIndex: 'sales_team',
                    key: 'sales_team',
                    width: 100,
                }

            ],
        },
    }, {
        title: Intl.get('crm.sales.customerStage', '客户阶段变更统计'),
        url: '/rest/customer/v2/customer/:data_type/customer/label/count',
        reqType: 'post',
        conditions: [{
            type: 'data',
            rangeParamName: 'name',
            value: 'time',
        }, {
            type: 'data',
            rangeParamName: 'type',
            value: 'time',
        }, {
            name: 'starttime',
            value: initialTime.start,
            type: 'data',
            rangeParamName: 'from',
        }, {
            name: 'endtime',
            value: initialTime.end,
            type: 'data',
            rangeParamName: 'to',
        }],
        chartType: 'table',
        layout: {
            sm: 24,
        },
        processData: data => {
            _.each(data, dataItem => {
                _.each(dataItem.map, (v, k) => {
                    //数字前显示加号
                    if (v && v > 0) {
                        v = '+' + v;
                    }

                    //将各阶段数据直接放到数据对象下，方便表格渲染时使用
                    dataItem[k] = v;
                });
            });

            return data;
        },
        option: {
            pagination: false,
            columns: [
                {
                    title: Intl.get('crm.146', '日期'),
                    dataIndex: 'time',
                    key: 'time',
                    width: 100
                }, {
                    title: Intl.get('sales.stage.message', '信息'),
                    dataIndex: '信息',
                    key: 'info',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('sales.stage.intention', '意向'),
                    dataIndex: '意向',
                    key: 'intention',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('common.trial', '试用'),
                    dataIndex: '试用',
                    key: 'trial',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('common.trial.qualified', '试用合格'),
                    dataIndex: '试用合格',
                    key: 'trial.qualified',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('common.trial.unqualified', '试用不合格'),
                    dataIndex: '试用不合格',
                    key: 'unqualified',
                    width: 100,
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('sales.stage.signed', '签约'),
                    dataIndex: '签约',
                    key: 'signed',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('sales.stage.lost', '流失'),
                    dataIndex: '流失',
                    key: '流失',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'memberName',
                    key: 'memberName'
                }, {
                    title: Intl.get('common.belong.team', '所属团队'),
                    dataIndex: 'salesTeam',
                    key: 'salesTeam',
                    width: 80
                }
            ],
        },
    }];
}
