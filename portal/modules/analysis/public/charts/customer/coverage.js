/**
 * 各行业试用客户覆盖率
 */

import Store from '../../store';
import { isSales } from '../../utils';
import { num as antUtilNum } from 'ant-utils';

//判断是否在蚁坊域的方法
const isOrganizationEefung = require('PUB_DIR/sources/utils/common-method-util').isOrganizationEefung;

//客户合格标签  1：当前合格  2：历史合格
const QUALIFY_LABEL_PASS = 1;

export function getCustomerCoverageChart() {
    return {
        title: Intl.get('oplate_customer_analysis.industryCustomerOverlay', '各行业试用客户覆盖率'),
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/customer/v2/statistic/:data_type/industry/stage/region/overlay',
        argCallback: arg => {
            const query = arg.query;

            if (query) {
                //"试用合格"标签需要特殊处理
                if (query.customer_label === Intl.get('common.trial.qualified', '试用合格')) {
                    query.customer_label = Intl.get('common.trial', '试用');
                    query.qualify_label = QUALIFY_LABEL_PASS;
                }
            }
        },
        noShowCondition: {
            callback: () => {
                //在当前登录的用户是销售或用户登录的不是蚁坊域时不显示
                return isSales() || !isOrganizationEefung();
            }
        },
        chartType: 'table',
        option: {
            pagination: false,
            columns: [
                {
                    title: Intl.get('common.definition', '名称'),
                    dataIndex: 'team_name',
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
                    title: Intl.get('oplate_bd_analysis_realm_zone.1', '省份'),
                    dataIndex: 'province_name',
                    width: 70
                }, {
                    title: Intl.get('oplate_customer_analysis.cityCount', '地市总数'),
                    dataIndex: 'city_count',
                    align: 'right',
                    width: 50
                }, {
                    title: Intl.get('weekly.report.open.account', '开通数'),
                    dataIndex: 'city_dredge_count',
                    align: 'right',
                    width: 50
                }, {
                    title: Intl.get('oplate_customer_analysis.overlay', '覆盖率'),
                    dataIndex: 'city_dredge_scale',
                    align: 'right',
                    width: 70,
                }, {
                    title: Intl.get('oplate_customer_analysis.countryCount', '区县总数'),
                    dataIndex: 'district_count',
                    align: 'right',
                    width: 50,
                }, {
                    title: Intl.get('weekly.report.open.account', '开通数'),
                    dataIndex: 'district_dredge_count',
                    align: 'right',
                    width: 50,
                }, {
                    title: Intl.get('oplate_customer_analysis.overlay', '覆盖率'),
                    dataIndex: 'district_dredge_scale',
                    align: 'right',
                    width: 70,
                },
            ],
        },
        processData: data => {
            let tempData = [];
            let list = [];
            if (data.result) {
                _.each(data.result, (value, key) => {
                    tempData.push({
                        team_name: key, team_result: value
                    });
                });
                tempData.forEach(teamItem => {
                    teamItem.team_result.forEach(sale => {
                        //地市覆盖率转百分比
                        sale.city_dredge_scale = antUtilNum.decimalToPercent(sale.city_dredge_scale);
                        //区县覆盖率转百分比
                        sale.district_dredge_scale = antUtilNum.decimalToPercent(sale.district_dredge_scale);
                        sale.team_name = teamItem.team_name;
                        //list中已有当前数据的团队名，不展示对应单元格(rowSpan==0)
                        if (list.find(item => item.team_name === teamItem.team_name)) {
                            sale.rowSpan = 0;
                        } else {
                            //为第一条存在团队名的数据设置列合并(rowSpan)
                            sale.rowSpan = teamItem.team_result.length;
                        }
                        list.push(sale);
                    });
                });
            }

            return list;
        },
        cardContainer: {
            selectors: [{
                optionsCallback: () => {
                    let options = [{
                        name: Intl.get('oplate_customer_analysis.allIndustries', '全部行业'),
                        value: '',
                    }];

                    _.map(Store.industryList, item => {
                        options.push({
                            name: item,
                            value: item
                        });
                    });

                    return options;
                },
                activeOption: '',
                conditionName: 'industry',
            }, {
                options: [
                    {
                        name: Intl.get('oplate_customer_analysis.allLabel', '全部标签'),
                        value: '',
                    },
                    Intl.get('sales.stage.message', '信息'),
                    Intl.get('sales.stage.intention', '意向'),
                    Intl.get('common.trial', '试用'),
                    Intl.get('common.trial.qualified', '试用合格'),
                    Intl.get('sales.stage.signed', '签约'),
                    Intl.get('contract.163', '续约'),
                    Intl.get('sales.stage.lost', '流失')
                ],
                activeOption: '',
                conditionName: 'customer_label',
            }],
        },
        conditions: [{
            name: 'industry',
            value: '',
        }, {
            name: 'customer_label',
            value: '',
        }],
    };
}
