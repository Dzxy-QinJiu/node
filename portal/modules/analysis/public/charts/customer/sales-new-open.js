/**
 * 销售新增客户数统计
 */
import Store from '../../store';

export function getSalesNewOpenChart(paramObj = {}) {
    return {
        title: Intl.get('oplate_customer_analysis.salesNewCustomerCount', '销售新增客户数统计'),
        url: '/rest/analysis/customer/v2/statistic/:auth_type/customer/user/new',
        chartType: 'table',
        option: {
            columns: [
                {
                    title: Intl.get('user.sales.team', '销售团队'),
                    dataIndex: 'team_name',
                    isSetCsvValueBlank: true,
                    width: 80
                },
                {
                    title: Intl.get('user.salesman', '销售人员'),
                    dataIndex: 'user_name',
                    isSetCsvValueBlank: true,
                    width: 80
                },
                {
                    title: Intl.get('common.number.of.new.customers', '新增客户数'),
                    dataIndex: 'newly_customer',
                    align: 'right',
                    width: 90
                },
                {
                    title: Intl.get('common.number.of.new.user.customer', '开通了用户的客户数'),
                    dataIndex: 'tatol_newly_users',
                    align: 'right',
                    width: 135
                },
                {
                    title: Intl.get('oplate_customer_analysis.customerLoginCount', '登录过的客户数'),
                    dataIndex: 'customer_login',
                    align: 'right',
                    width: 120
                }
            ],
        },
        processData: (data, chart) => {
            //设置图表的卡片容器属性
            setCardContainer(chart);

            let list = [];
            if (data.list && data.list.length > 0) {
                data.list.forEach(teamItem => {
                    teamItem.team_result.forEach((sale, index) => {
                        sale.team_name = teamItem.team_name;
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
        conditions: [{
            name: 'tags',
            value: '',
        }],
    };

    //设置图表的卡片容器属性
    function setCardContainer(chart) {
        const userTypeList = Store.userTypeList;

        chart.cardContainer = {
            selectors: [{
                options: userTypeList,
                activeOption: '',
                conditionName: 'tags',
            }],
        };
    }
}
