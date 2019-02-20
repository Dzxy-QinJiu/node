/**
 * 转出客户明细
 */

import { initialTime } from '../../consts';

export function getCustomerTransferChart() {
    return {
        title: '转出客户明细',
        url: '/rest/customer/v2/customer/transfer/record/1000/time/descend',
        reqType: 'post',
        conditions: [{
            type: 'data',
            value: 'time',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].name', value);
            }
        }, {
            type: 'data',
            value: 'time',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].type', value);
            }
        }, {
            name: 'starttime',
            value: initialTime.start,
            type: 'data',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].from', value);
            }
        }, {
            name: 'endtime',
            value: initialTime.end,
            type: 'data',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].to', value);
            }
        }],
        dataField: 'result',
        chartType: 'table',
        layout: {
            sm: 24,
        },
        height: 'auto',
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
    };
}
