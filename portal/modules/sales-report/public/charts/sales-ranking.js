/**
 * 销售排名
 */

export const salesRankingChart = {
    title: '销售排名',
    chartType: 'radar',
    layout: {sm: 24},
    height: 300,
    url: [
        //合同数排名
        '/rest/analysis/contract/contract/:data_type/order/contract/count',
        //回款毛利排名
        '/rest/analysis/contract/contract/:data_type/order/repay/gross/profit',
        //客户流失率排名
        '/rest/analysis/contract/contract/:data_type/order/customer/churn/rate',
        //销售跟进客户数排名
        '/rest/analysis/customer/v2/customertrace/:data_type/sale/trace/ranking',
    ],
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
                rankingData = _.get(dataItem, 'list[0].sales_list[0]');
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
                indicator: [
                    {text: '合同数排名', max},
                    {text: '回款毛利排名', max},
                    {text: '流失客户数排名', max},
                    {text: '跟进客户数排名', max}
                ],
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
};
