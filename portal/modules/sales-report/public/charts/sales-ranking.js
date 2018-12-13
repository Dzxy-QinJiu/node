/**
 * 销售排名
 */

//销售人数
const NUM_OF_SALES = {
    //所在团队
    team: 30,
    //上级团队
    superior: 80,
    //所有
    all: 200
};

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
                value: [],
                realValue: []
            };
            //上级团队内排名
            let intraSuperiorTeamRanking = {
                name: '上级团队内排名',
                value: [],
                realValue: []
            };
            //销售部内排名
            let intraSalesDepartmentRanking = {
                name: '销售部内排名',
                value: [],
                realValue: []
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
                    //画图用的值要用其所在团队的人数减去其排名，以使其在图上的位置与其排名成反比，即排名越小的在图上的位置越靠外
                    intraTeamRanking.value.push(NUM_OF_SALES.team - rankingData.order);
                    //真实值，用于在tooltip上显示
                    intraTeamRanking.realValue.push(rankingData.order);
                } else {
                    isDataValid = false;
                    return false;
                }

                //上级团队内排名
                if (_.has(rankingData, 'superior_order')) {
                    intraSuperiorTeamRanking.value.push(NUM_OF_SALES.superior - rankingData.superior_order);
                    intraSuperiorTeamRanking.realValue.push(rankingData.superior_order);
                } else {
                    isDataValid = false;
                    return false;
                }

                //销售部内排名
                if (_.has(rankingData, 'sales_order')) {
                    intraSalesDepartmentRanking.value.push(NUM_OF_SALES.all - rankingData.sales_order);
                    intraSalesDepartmentRanking.realValue.push(rankingData.sales_order);
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
                trigger: 'item',
                formatter: params => {
                    let content = [params.name];

                    _.each(dimensions, (item, index) => {
                        const text = item + ': ' + params.data.realValue[index];

                        content.push(text);
                    });

                    const contentHtml = content.join('<br>');

                    return contentHtml;
                }
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
                getIndicator(NUM_OF_SALES.team, '15%'),
                getIndicator(NUM_OF_SALES.superior, '50%'),
                getIndicator(NUM_OF_SALES.all, '85%')
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
