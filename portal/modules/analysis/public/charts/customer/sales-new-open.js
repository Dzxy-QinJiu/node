/**
 * 销售新开客户数统计
 */

import { argCallbackMemberIdsToMemberId } from '../../utils';

export function getSalesNewOpenChart(paramObj = {}) {
    return {
        title: Intl.get('oplate_customer_analysis.salesNewCustomerCount', '销售新开客户数统计'),
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/customer/v2/statistic/:auth_type/customer/user/new',
        argCallback: argCallbackMemberIdsToMemberId,
        chartType: 'table',
        option: {
            columns: [
                {
                    title: Intl.get('user.sales.team', '销售团队'),
                    dataIndex: 'team_name',
                    isSetCsvValueBlank: true,
                    render: (text, item, index) => {
                        return {
                            children: text,
                            props: {
                                rowSpan: item.rowSpan
                            },
                        };
                    },
                    width: 100
                },
                {
                    title: Intl.get('user.salesman', '销售人员'),
                    dataIndex: 'user_name',
                    width: 80
                },
                {
                    title: Intl.get('oplate_customer_analysis.newCustomerCount', '新开客户数'),
                    dataIndex: 'newly_customer',
                    align: 'right',
                    width: 80
                },
                {
                    title: Intl.get('oplate_customer_analysis.tatolNewCustomerCount', '新开账号数总数'),
                    dataIndex: 'tatol_newly_users',
                    align: 'right',
                    width: 80
                },
                {
                    title: Intl.get('oplate_customer_analysis.customerLoginCount', '新开通客户登录数'),
                    dataIndex: 'customer_login',
                    align: 'right',
                    width: 80
                }
            ],
        },
        customOption: {
            dataProcessor: (data) => {
                let list = [];
                if (data.list && data.list.length > 0) {
                    data.list.forEach(teamItem => {
                        teamItem.team_result.forEach((sale, index) => {
                            sale.team_name = teamItem.team_name;
                            if (list.find(item => item.team_name === teamItem.team_name)) {
                                sale.rowSpan = 0;
                            } else {
                                sale.rowSpan = teamItem.team_result.length;
                            }
                            list.push(sale);
                            //在每个团队最后一个销售的数据后加上合计
                            if (index === teamItem.team_result.length - 1) {
                                list.push($.extend({}, teamItem.team_total, {
                                    user_name: Intl.get('sales.home.total.compute', '总计')
                                }));
                            }
                        });
                    });
                    //在数据最后添加总的合计
                    if (data.total) {
                        list.push($.extend({}, data.total, {
                            team_name: Intl.get('sales.home.total.compute', '总计')
                        }));
                    }
                }

                return list;
            },
        },
        cardContainer: {
            selectors: [{
                options: [{
                    value: '',
                    name: Intl.get('oplate_customer_analysis.type.all', '全部类型')
                },
                {
                    value: '试用用户',
                    name: Intl.get('oplate_customer_analysis.type.trial', '试用用户')
                },
                {
                    value: '正式用户',
                    name: Intl.get('oplate_customer_analysis.type.formal', '正式用户')
                },
                {
                    value: 'internal',
                    name: Intl.get('oplate_customer_analysis.type.employee', '员工用户')
                },
                {
                    value: 'special',
                    name: Intl.get('oplate_customer_analysis.type.gift', '赠送用户')
                },
                {
                    value: 'training',
                    name: Intl.get('oplate_customer_analysis.type.training', '培训用户')
                }],
                activeOption: '',
                conditionName: 'tags',
            }],
        },
        conditions: [{
            name: 'tags',
            value: '',
        }],
    };
}
