/**
 * 客户阶段变更统计
 */

import { initialTime } from '../../consts';
import { argCallbackUnderlineTimeToTime } from '../../utils';

export function getCustomerStageChangeChart() {
    return {
        title: Intl.get('crm.sales.customerStage', '客户阶段变更统计'),
        url: '/rest/analysis/customer/v2/:data_type/customer/label/count',
        argCallback: argCallbackUnderlineTimeToTime,
        dataField: 'result',
        chartType: 'table',
        layout: {
            sm: 24,
        },
        height: 'auto',
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
    };
}
