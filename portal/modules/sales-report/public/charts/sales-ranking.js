/**
 * 销售排名
 */

export function getSalesRankingChart(role) {
    let url = [
        //合同数排名
        '/rest/analysis/contract/contract/:data_type/order/contract/count',
        //回款毛利排名
        '/rest/analysis/contract/contract/:data_type/order/repay/gross/profit',
        //客户流失率排名
        '/rest/analysis/contract/contract/:data_type/order/customer/churn/rate',
        //销售跟进客户数排名
        '/rest/analysis/customer/v2/customertrace/:data_type/sale/trace/ranking',
    ];

    //维度
    let dimensions = [
        '合同数排名',
        '回款毛利排名',
        '流失客户数排名',
        '跟进客户数排名'
    ];

    //如果是销售经理
    if (role === 'salesManager') {
        url = [
            //合格客户数排名
            '/rest/analysis/customer/v2/:data_type/customer/qualify/ranking',
            //电话排名
            '/rest/analysis/customer/v2/customertrace/:data_type/sale/phone/ranking',
            //客户活跃率排名
            '/rest/analysis/customer/label/:data_type/order/active/rate',
            //提交机会排名
            '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/sale/submit/ranking',
            //成交数排名
            '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/sale/deal/ranking'
        ];

        dimensions = [
            '合格客户数排名',
            '电话排名',
            '客户活跃率排名',
            '提交机会排名',
            '成交数排名'
        ];
    }

    return {
        title: '销售排名',
        chartType: 'radar',
        layout: {sm: 24},
        height: 300,
        url,
        ajaxInstanceFlag: 'sales_report_sales_ranking',
        argCallback: arg => {
            if (arg.query.member_id) {
                arg.query.member_ids = arg.query.member_id;
                delete arg.query.member_id;
            }

            if (arg.query.starttime) {
                arg.query.start_time = arg.query.starttime;
                delete arg.query.start_time;
            }

            if (arg.query.endtime) {
                arg.query.end_time = arg.query.endtime;
                delete arg.query.end_time;
            }
        },
        processData: data => {
            let processedData = [];

            //团队内排名
            let intraTeamRanking = {
                name: '团队内排名',
                value: []
            };
            //上级团队内排名
            let intraSuperiorTeamRanking = {
                name: '上级团队内排名',
                value: []
            };
            //销售部内排名
            let intraSalesDepartmentRanking = {
                name: '销售部内排名',
                value: []
            };

            //数据是否有效
            let isDataValid = true;

            _.each(data, (dataItem, index) => {
                let rankingData; 

                if (_.isArray(dataItem)) {
                    rankingData = dataItem[0];
                } else if (_.isObject(dataItem)) {
                    if (_.has(dataItem, 'result')) {
                        rankingData = _.get(dataItem, 'result.list[0].sales_list[0]');
                    } else {
                        rankingData = _.get(dataItem, 'list[0].sales_list[0]');
                    }
                } else {
                    isDataValid = false;
                    return false;
                }

                //团队内排名
                if (_.has(rankingData, 'order')) {
                    intraTeamRanking.value.push(rankingData.order);
                } else {
                    isDataValid = false;
                    return false;
                }

                //上级团队内排名
                if (_.has(rankingData, 'superior_order')) {
                    intraSuperiorTeamRanking.value.push(rankingData.superior_order);
                } else {
                    isDataValid = false;
                    return false;
                }

                //销售部内排名
                if (_.has(rankingData, 'sales_order')) {
                    intraSalesDepartmentRanking.value.push(rankingData.sales_order);
                } else {
                    isDataValid = false;
                    return false;
                }
            });

            if (isDataValid) {
                processedData.push(intraTeamRanking, intraSuperiorTeamRanking, intraSalesDepartmentRanking);
            }

            return processedData;
        },
        processOption: (option, chartProps) => {
            option.legend = {
                data: _.map(chartProps.data, 'name')
            };

            option.tooltip = {
                trigger: 'item'
            };

            function getIndicator(max, centerLeft) {
                return {
                    indicator: _.map(dimensions, dimension => {
                        return {text: dimension, max};
                    }),
                    center: [centerLeft, '55%'],
                    radius: 80
                };
            }

            option.radar = [
                getIndicator(30, '15%'),
                getIndicator(80, '50%'),
                getIndicator(200, '85%')
            ];

            option.series = _.map(chartProps.data, (dataItem, index) => {
                return {
                    type: 'radar',
                    radarIndex: index,
                    itemStyle: {
                        normal: {
                            areaStyle: {type: 'default'}
                        }
                    },
                    data: [dataItem]
                };
            });
        },
        generateCsvData: data => {
            let csvData = [];
            let header = [];
            let body = [];

            _.each(data, dataItem => {
                _.each(dataItem.value, (valueItem, index) => {
                    const colName = dataItem.name.replace('排名', '') + dimensions[index];

                    header.push(colName);
                    body.push(valueItem);
                });
            });

            csvData.push(header, body);

            return csvData;
        }
    };
}
