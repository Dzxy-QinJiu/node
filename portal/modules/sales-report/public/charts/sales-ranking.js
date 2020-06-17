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
        Intl.get('analysis.number.of.contracts', '合同数'),
        Intl.get('contract.29', '回款毛利'),
        Intl.get('analysis.number.of.lost.customers', '流失客户数'),
        Intl.get('analysis.number.of.follow-up.customers', '跟进客户数')
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
            Intl.get('common.number.of.qualified.customers', '合格客户数'),
            Intl.get('analysis.number.of.calls', '电话数'),
            Intl.get('analysis.customer.activity.rate', '客户活跃率'),
            Intl.get('analysis.submit.opportunity', '提交机会'),
            Intl.get('common.deal.number', '成交数')
        ];
    }

    return {
        title: Intl.get('analysis.sales.ranking', '销售排名'),
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

                if (rankingData) {
                    processedData.push(rankingData);
                }
            });

            return isDataValid ? processedData : [];
        },
        processOption: (option, chartProps) => {
            const data = chartProps.data;

            //包含各层团队人数的数据
            let dataWithLevelNum = _.first(data) || {
                //一级团队人数，默认200
                first_level_num: 200,
                //二级团队人数，默认80
                second_level_num: 80,
                //三级团队人数，默认30
                third_level_num: 30
            };

            //一级团队人数
            const firstLevelNum = dataWithLevelNum.first_level_num;
            //二级团队人数
            const secondLevelNum = dataWithLevelNum.second_level_num;
            //三级团队人数
            const thirdLevelNum = dataWithLevelNum.third_level_num;

            //团队内排名
            let intraTeamRanking = getRankingObj(Intl.get('analysis.ranking.within.the.team', '团队内排名'));
            //上级团队内排名
            let intraSuperiorTeamRanking = getRankingObj(Intl.get('analysis.ranking.within.superior.team', '上级团队内排名'));
            //销售部内排名
            let intraSalesDepartmentRanking = getRankingObj(Intl.get('analysis.ranking.in.sales.department', '销售部内排名'));

            _.each(data, dataItem => {
                //设置团队内排名
                setRankingValue(dataItem, 'order', intraTeamRanking, thirdLevelNum);
                //设置上级团队内排名
                setRankingValue(dataItem, 'superior_order', intraSuperiorTeamRanking, secondLevelNum);
                //设置销售部内排名
                setRankingValue(dataItem, 'sales_order', intraSalesDepartmentRanking, firstLevelNum);

            });

            const renderData = [intraTeamRanking, intraSuperiorTeamRanking, intraSalesDepartmentRanking];

            option.legend = {
                data: _.map(renderData, 'name')
            };

            option.tooltip = {
                trigger: 'item',
                formatter: params => {
                    let content = ['<b style="font-size: 15px">' + params.name + '</b>'];

                    _.each(dimensions, (item, index) => {
                        const count = _.get(params, 'data.countArr[' + index + ']', '');
                        const rank = _.get(params, 'data.realValue[' + index + ']', '');
                        const countText = `${item}: ${count}, ${Intl.get('common.ranking', '排名')}: ${rank}`;

                        content.push(countText);
                    });

                    const contentHtml = content.join('<br>');

                    return contentHtml;
                }
            };

            option.radar = [
                getIndicator(dimensions, thirdLevelNum, '15%'),
                getIndicator(dimensions, secondLevelNum, '50%'),
                getIndicator(dimensions, firstLevelNum, '85%')
            ];

            option.series = _.map(renderData, (dataItem, index) => {
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

//获取指标
function getIndicator(dimensions, max, centerLeft) {
    return {
        indicator: _.map(dimensions, dimension => {
            return {text: dimension, max};
        }),
        center: [centerLeft, '55%'],
        radius: 80
    };
}
