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
            '电话数排名',
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

            //获取排名对象
            function getRankingObj(name) {
                return {
                    name,
                    //绘图值
                    value: [],
                    //真实值
                    realValue: [],
                    //具体数值，如客户数、成交数等
                    countArr: []
                };
            }

            //团队内排名
            let intraTeamRanking = getRankingObj('团队内排名');
            //上级团队内排名
            let intraSuperiorTeamRanking = getRankingObj('上级团队内排名');
            //销售部内排名
            let intraSalesDepartmentRanking = getRankingObj('销售部内排名');

            //数据是否有效
            let isDataValid = true;

            //将排名值设置到对应的排名对象
            function setRankingValue(data, field, rankingObj, total) {
                if (_.has(data, field)) {
                    //画图用的值要用参与排名的总人数减去其排名，以使其在图上的位置与其排名成反比，即排名越小的在图上的位置越靠外
                    rankingObj.value.push(total - data[field]);
                    //真实值，用于在tooltip上显示
                    rankingObj.realValue.push(data[field]);
                    //具体数值，如客户数、成交数等
                    rankingObj.countArr.push(data.value);
                } else {
                    rankingObj.value.push(0);
                    rankingObj.realValue.push(0);
                    rankingObj.countArr.push(0);
                }
            }

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

                //设置团队内排名
                setRankingValue(rankingData, 'order', intraTeamRanking, NUM_OF_SALES.team);
                //设置上级团队内排名
                setRankingValue(rankingData, 'superior_order', intraSuperiorTeamRanking, NUM_OF_SALES.superior);
                //设置销售部内排名
                setRankingValue(rankingData, 'sales_order', intraSalesDepartmentRanking, NUM_OF_SALES.all);
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
                    let content = ['<b style="font-size: 15px">' + params.name + '</b>'];

                    _.each(dimensions, (item, index) => {
                        const rankText = item + ': ' + params.data.realValue[index];
                        const countText = item.replace('排名', '') + ': ' + params.data.countArr[index];

                        content.push(rankText, countText);
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
                _.each(dataItem.realValue, (valueItem, index) => {
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
