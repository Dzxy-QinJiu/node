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
        '合同数',
        '回款毛利',
        '流失客户数',
        '跟进客户数'
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
            '合格客户数',
            '电话数',
            '客户活跃率',
            '提交机会',
            '成交数'
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
        processChart: chart => {
            const data = chart.data;
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
                    let showValue = total - data[field];
                    //真实值，用于在tooltip上显示
                    let realValue = data[field];
                    //具体数值，如客户数、成交数等
                    const count = data.value;

                    //如果数值为0，但排名为1，说明大家都是0，此时将排名置为0
                    if (count === 0 && realValue === 1) {
                        realValue = 0;
                        showValue = 0;
                    }

                    rankingObj.value.push(showValue);
                    rankingObj.realValue.push(realValue);
                    rankingObj.countArr.push(count);
                } else {
                    rankingObj.value.push(0);
                    rankingObj.realValue.push(0);
                    rankingObj.countArr.push(0);
                }
            }

            //包含各层团队人数的数据
            let dataWithLevelNum = {
                //一级团队人数，默认200
                first_level_num: 200,
                //二级团队人数，默认80
                second_level_num: 80,
                //三级团队人数，默认30
                third_level_num: 30
            };

            //销售经理第一个维度的排名数据
            const salesManagerFirstRankingData = _.get(data, '[0].list[0].sales_list[0]');

            //如果存在销售经理第一个维度的排名数据
            //因为约定团队人数由第一个维度的排名数据返回
            //所以此时包含团队人数的数据即为销售经理第一个维度的排名数据
            if (salesManagerFirstRankingData) {
                dataWithLevelNum = salesManagerFirstRankingData;
            } else {
                //客户经理第一个维度的排名数据
                const customerManagerFirstRankingData = _.get(data, '[0][0]');

                //如果存在客户经理第一个维度的排名数据
                //因为约定团队人数由第一个维度的排名数据返回
                //所以此时包含团队人数的数据即为客户经理第一个维度的排名数据
                if (customerManagerFirstRankingData) {
                    dataWithLevelNum = customerManagerFirstRankingData;
                }
            }

            //一级团队人数
            const firstLevelNum = dataWithLevelNum.first_level_num;
            //二级团队人数
            const secondLevelNum = dataWithLevelNum.second_level_num;
            //三级团队人数
            const thirdLevelNum = dataWithLevelNum.third_level_num;

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
                setRankingValue(rankingData, 'order', intraTeamRanking, thirdLevelNum);
                //设置上级团队内排名
                setRankingValue(rankingData, 'superior_order', intraSuperiorTeamRanking, secondLevelNum);
                //设置销售部内排名
                setRankingValue(rankingData, 'sales_order', intraSalesDepartmentRanking, firstLevelNum);
            });

            if (isDataValid) {
                processedData.push(intraTeamRanking, intraSuperiorTeamRanking, intraSalesDepartmentRanking);
            }

            let option = chart.option = {};

            option.legend = {
                data: _.map(processedData, 'name')
            };

            option.tooltip = {
                trigger: 'item',
                formatter: params => {
                    let content = ['<b style="font-size: 15px">' + params.name + '</b>'];

                    _.each(dimensions, (item, index) => {
                        const countText = item + ': ' + params.data.countArr[index] + ', 排名: ' + params.data.realValue[index];

                        content.push(countText);
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
                getIndicator(thirdLevelNum, '15%'),
                getIndicator(secondLevelNum, '50%'),
                getIndicator(firstLevelNum, '85%')
            ];

            option.series = _.map(processedData, (dataItem, index) => {
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
        processCsvData: chart => {
            const data = chart.data;
            let csvData = [];
            let header = [];
            let body = [];

            _.each(data, dataItem => {
                _.each(dataItem.realValue, (valueItem, index) => {
                    const colName = dimensions[index] + dataItem.name;

                    header.push(colName);
                    body.push(valueItem);
                });
            });

            csvData.push(header, body);

            return csvData;
        }
    };
}
