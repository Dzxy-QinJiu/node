/**
 * 签约客户净增分析
 */

import userData from 'PUB_DIR/sources/user-data';
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import {listPanelEmitter} from 'PUB_DIR/sources/utils/emitters';

export function getSignedCustomerNetIncreaseChart(paramObj = {}) {
    return {
        title: '签约客户净增分析',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/sign/customer',
        argCallback: arg => {
            paramObj.argCallback(arg);

            let query = arg.query;
            //用日期选择器上当前选择的时间区间作为查询的时间区间
            query.interval = query.time_range;
        },
        processData: (data, chart, analysisInstance) => {
            const conditions = _.cloneDeep(analysisInstance.state.conditions);

            chart.option = {
                columns: [{
                    title: Intl.get('crm.contract.new.sign', '新签'),
                    dataIndex: 'new_customers',
                    width: '25%',
                    render: clickableCellRender.bind(null, conditions, 'new')
                }, {
                    title: Intl.get('common.reflux', '回流'),
                    dataIndex: 'reflux_customers',
                    width: '25%',
                    render: clickableCellRender.bind(null, conditions, 'reflux')
                }, {
                    title: Intl.get('contract.171', '流失'),
                    dataIndex: 'churn_customers',
                    width: '25%',
                    render: clickableCellRender.bind(null, conditions, 'churn')
                }, {
                    title: Intl.get('common.net.increase', '净增'),
                    dataIndex: 'net_new_customers',
                    width: '25%',
                }],
            };

            return [data];
        },
    };
}

function clickableCellRender(conditions, customerType, value) {
    return (
        <span
            style={{cursor: 'pointer'}}
            onClick={handleNumberClick.bind(null, conditions, customerType)}
        >
            {value}
        </span>
    );
}

function handleNumberClick(conditions, customerType, e) {
    Trace.traceEvent(e, '点击签约客户净增分析表格上的数字查看详细列表');

    const dataTypeCondition = _.find(conditions, item => item.name === 'data_type');
    const dataType = _.get(dataTypeCondition, 'value', 'all');

    conditions = _.filter(conditions, item => !item.type);

    conditions.push({
        name: 'customer_type',
        value: customerType
    });
    
    let columns = [
        {
            title: Intl.get('crm.41', '客户名'),
            dataIndex: 'customer_name',
            width: '20%'
        },
    ];

    //是否普通销售
    let isCommonSales = userData.getUserData().isCommonSales;

    if (!isCommonSales) {
        columns.push(
            {
                title: Intl.get('crm.6', '负责人'),
                dataIndex: 'member_name',
                width: '20%'
            }
        );
    }

    const paramObj = {
        listType: 'customer',
        url: `/rest/analysis/customer/label/${dataType}/sign/customer/detail`,
        dataField: null,
        conditions,
        columns,
        onRowClick: record => {
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                customer_params: {
                    currentId: record.customer_id 
                }
            });
        }
    };

    listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
}
