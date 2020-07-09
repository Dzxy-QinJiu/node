/**
 * 超3个月没有续约的客户
 */

import { phoneMsgEmitter } from 'OPLATE_EMITTER';
import { dataType } from '../../consts';

export function getUnrenewedCustomerChart() {
    return {
        title: Intl.get('analysis.unrenewed.customer.statistics', '超3个月没有续约的客户'),
        chartType: 'table',
        layout: {sm: 24},
        height: 450,
        url: `/rest/analysis/contract/contract/v2/${dataType}/expired/customer`,
        processData: data => {
            _.each(data, item => {
                item.timestamp = moment(item.timestamp).format(oplateConsts.DATE_FORMAT);
            });

            return data;
        },
        option: {
            columns: [{
                title: Intl.get('crm.41', '客户名'),
                dataIndex: 'customer_name',
                render: (value, record) => {
                    return <a href="javascript:void(0)" onClick={showCustomer.bind(null, record.customer_id)}>{value}</a>;
                },
                width: 150,
            }, {
                title: Intl.get('menu.sales.process', '客户阶段'),
                dataIndex: 'customer_label',
                width: 80,
            }, {
                title: Intl.get('crm.6', '负责人'),
                dataIndex: 'member_name',
                width: 80,
            }, {
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: 80,
            }, {
                title: Intl.get('user.time.end', '到期时间'),
                dataIndex: 'timestamp',
                width: 100,
            }],
        }
    };

    function showCustomer(id) {
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: id 
            }
        });
    }
}
