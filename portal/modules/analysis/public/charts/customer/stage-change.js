/**
 * 客户阶段变更统计
 */

import { initialTime } from '../../consts';
import { argCallbackUnderlineTimeToTime } from '../../utils';

export function getCustomerStageChangeChart() {
    //当前查询的时间区间参数值
    let interval;

    return {
        title: Intl.get('crm.sales.customerStage', '客户阶段变更统计'),
        url: '/rest/analysis/customer/v2/:data_type/customer/label/count',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);

            //将当前查询的时间区间参数值记录下来以供其他回调函数使用
            interval = _.get(arg, 'query.interval');
        },
        dataField: 'result',
        chartType: 'table',
        layout: {
            sm: 24,
        },
        height: 'auto',
        processData: data => {
            _.each(data, dataItem => {
                //时间区间查询参数有值且其值不是天时，日期列显示为 xxxx-xx-xx至xxxx-xx-xx 的格式
                if (interval && interval !== 'day') {
                    if (interval === 'week') {
                        //用iso格式的周开始时间，这样是从周一到周天算一周，而不是从周天到周六
                        interval = 'isoweek';
                    }

                    const startDate = moment(dataItem.time).startOf(interval).format(oplateConsts.DATE_FORMAT);
                    const endDate = moment(dataItem.time).endOf(interval).format(oplateConsts.DATE_MONTH_DAY_FORMAT);

                    dataItem.time = `${startDate} ${Intl.get('contract.83', '至')} ${endDate}`;
                }

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
            columns: [
                {
                    title: Intl.get('crm.146', '日期'),
                    dataIndex: 'time',
                }, {
                    title: Intl.get('sales.stage.message', '信息'),
                    dataIndex: Intl.get('sales.stage.message', '信息'),
                    align: 'right',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('sales.stage.intention', '意向'),
                    dataIndex: Intl.get('sales.stage.intention', '意向'),
                    align: 'right',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('common.trial', '试用'),
                    dataIndex: Intl.get('common.trial', '试用'),
                    align: 'right',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('common.trial.qualified', '试用合格'),
                    dataIndex: Intl.get('common.trial.qualified', '试用合格'),
                    align: 'right',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('common.trial.unqualified', '试用不合格'),
                    dataIndex: Intl.get('common.trial.unqualified', '试用不合格'),
                    align: 'right',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('sales.stage.signed', '签约'),
                    dataIndex: Intl.get('sales.stage.signed', '签约'),
                    align: 'right',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('sales.stage.lost', '流失'),
                    dataIndex: Intl.get('sales.stage.lost', '流失'),
                    align: 'right',
                    render: (text, item, index) => {
                        return (
                            <span className="customer-stage-number">{text}</span>
                        );
                    }
                }, {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'memberName',
                }, {
                    title: Intl.get('common.belong.team', '所属团队'),
                    dataIndex: 'salesTeam',
                }
            ],
        },
        processOption: option => {
            _.each(option.columns, column => {
                //在当前列是日期列，同时时间区间查询参数有值且其值不是天时，将列宽设的大一些，以防止折行
                if (column.dataIndex === 'time' && (interval && interval !== 'day')) {
                    column.width = 150;
                } else {
                    column.width = 100;
                }
            });
        }
    };
}
