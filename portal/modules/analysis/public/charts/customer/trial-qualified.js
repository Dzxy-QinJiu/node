/**
 * 试用合格详细统计表
 */

import { analysisCustomerListEmitter } from 'PUB_DIR/sources/utils/emitters';
import { CUSTOMER_IDS_FIELD } from '../../consts';

export function getCustomerTrialQualifiedChart() {
    return {
        title: '试用合格详细统计表',
        chartType: 'table',
        height: 'auto',
        layout: {sm: 24},
        url: '/rest/analysis/customer/v2/statistic/:data_type/customer/qualify',
        dataField: 'list',
        processOption: (option, chartProps) => {
            //接口数据
            const data = _.get(chartProps, 'data', []);
            //接口数据第一项
            const firstItem = data[0];

            //若不存在接口数据第一项，说明接口数据为空
            if (!firstItem) {
                //将表格列定义设为空数组，防止渲染报错
                option.columns = [];
                //将表格数据设为空数组，防止渲染报错
                option.dataSource = [];

                //无需再进行其他处理，直接返回
                return;
            }

            //表格列定义
            let columns = [];

            //若接口数据第一项中存在销售昵称，说明返回的是销售列表，需要显示销售列
            if (firstItem.nick_name) {
                columns.push({
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'nick_name',
                    width: '10%',
                });
            }

            //设置团队列
            columns.push({
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'team_name',
                width: '10%',
            });

            //统计数据的生成时间
            const addMoment = moment(firstItem.add_time);

            //统计数据产生的截止月
            const thisMonth = addMoment.get('month') + 1;

            //统计数据产生的截止月的上一个月
            const lastMonth = addMoment.clone().subtract(1, 'months').get('month') + 1;

            //列定义中增加本月、上月等列
            columns = columns.concat([{
                title: lastMonth + Intl.get('common.time.unit.month', '月'),
                dataIndex: 'last_month',
                align: 'right',
                width: '10%',
                render: trialQualifiedNumRender.bind(this, 'last_month_customer_ids'),
            }, {
                title: thisMonth + Intl.get('common.time.unit.month', '月'),
                dataIndex: 'this_month',
                align: 'right',
                width: '10%',
                render: trialQualifiedNumRender.bind(this, 'this_month_customer_ids'),
            }, {
                dataIndex: 'highest',
                align: 'right',
                title: Intl.get('common.history.highest', '历史最高'),
                width: '10%',
                render: trialQualifiedNumRender.bind(this, CUSTOMER_IDS_FIELD),
            }, {
                dataIndex: 'this_month_add_highest',
                align: 'right',
                title: Intl.get('common.this.month.add.highest', '本月比历史最高净增'),
                width: '20%',
                render: trialQualifiedNumRender.bind(this, 'this_month_add_highest_customer_ids'),
            }]);

            //表格数据
            const dataSource = _.map(data, dataItem => {
                //处理后的数据项
                let processedItem = {};

                //若原始数据项中包含销售昵称，则将该昵称加入处理后的数据项
                if (dataItem.nick_name) {
                    processedItem.nick_name = dataItem.nick_name;
                }

                //若原始数据项中包含团队名称，则将该团队名称加入处理后的数据项
                if (dataItem.team_name) {
                    processedItem.team_name = dataItem.team_name;
                }

                if (dataItem.highest) {
                    processedItem.highest_data = dataItem.highest;
                }

                //遍历原始数据项各字段
                _.each(dataItem, (value, key) => {
                    //若字段值中存在总数
                    if (_.has(value, 'total')) {
                        //则将该总数加入处理后的数据项
                        processedItem[key] = value.total;
                    }

                    //若字段值中存在客户id数据
                    if (value.customer_ids) {
                        //则将客户id数据加入处理后的数据项
                        processedItem[key + '_customer_ids'] = value.customer_ids;
                    }
                });

                return processedItem;
            });

            option.columns = columns;
            option.dataSource = dataSource;
        },
    };
}

function handleTrialQualifiedNumClick(customerIds, text, customerIdsField, record) {
    const customerIdsStr = customerIds.join(',');
    const num = parseFloat(text);

    analysisCustomerListEmitter.emit(analysisCustomerListEmitter.SHOW_CUSTOMER_LIST, customerIdsStr, num, customerIdsField, record); 
}

function trialQualifiedNumRender(customerIdsField, text, record) {
    if (text || customerIdsField === CUSTOMER_IDS_FIELD) {
        const customerIds = record[customerIdsField] || [];

        return (
            <span onClick={handleTrialQualifiedNumClick.bind(this, customerIds, text, customerIdsField, record)} style={{cursor: 'pointer'}}>
                {text}
            </span>
        );
    } else {
        return (
            <span>
                {text}
            </span>
        );
    }
}
