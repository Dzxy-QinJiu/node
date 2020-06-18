/**
 * 转出客户明细
 */

import { initialTime } from '../../consts';

export function getCustomerTransferChart() {
    return {
        title: Intl.get('analysis.transfer.out.customer.details', '转出客户明细'),
        chartType: 'table',
        layout: {
            sm: 24,
        },
        height: 'auto',
        url: '/rest/analysis/customer/v2/:data_type/transfer/record/1000/time/descend',
        dataField: 'result',
        processData: data => {
            _.each(data, item => {
                item.time = moment(item.time).format(oplateConsts.DATE_FORMAT);
            });

            return data;
        },
        option: {
            columns: [
                {
                    title: Intl.get('common.login.time', '时间'),
                    dataIndex: 'time',
                    sorter: true,
                    width: 100,
                }, {
                    title: Intl.get('crm.41', '客户名'),
                    dataIndex: 'customer_name',
                    width: 300,
                    isSetCsvValueBlank: true
                }, {
                    title: Intl.get('crm.customer.transfer.sales', '销售代表'),
                    dataIndex: 'old_member_nick_name',
                    width: 100,
                }, {
                    title: Intl.get('crm.customer.transfer.manager', '客户经理'),
                    dataIndex: 'new_member_nick_name',
                    width: 100,
                }, {
                    title: Intl.get('user.sales.team', '销售团队'),
                    dataIndex: 'sales_team',
                    width: 100,
                }

            ],
        },
    };
}
