/**
 * 新机会统计
 */

export function getNewChanceChart(chartType = 'table') {
    let chart = {
        title: '新机会统计',
        chartType,
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/rate',
        ajaxInstanceFlag: 'sales_opportuniry_new',
        dataField: 'result',
    };

    if (chartType === 'funnel') {
        chart.customOption = {
            valueField: 'showValue',
            minSize: '5%',
        };

        chart.processData = processDataFunnel;
    } else if (chartType === 'table') {
        chart.processData = data => {
            const result = _.get(data, 'result');

            return result ? [data.result] : [];
        };

        chart.option = {
            columns: [
                {
                    title: '提交数',
                    dataIndex: 'total',
                    width: '20%',
                }, {
                    title: '成交数',
                    dataIndex: 'deal',
                    width: '20%',
                }, {
                    title: '成交率',
                    dataIndex: 'deal_rate',
                    width: '20%',
                    render: text => {
                        text = (text * 100).toFixed(2) + '%';
                        return <span>{text}</span>;
                    }
                }
            ]
        };
    }

    return chart;

    //处理漏斗图数据
    function processDataFunnel(data) {
        const stages = [
            {
                tagName: '提交数',
                tagValue: 'total',
            },
            {
                tagName: '通过数',
                tagValue: 'pass',
            },
            {
                tagName: '成交数',
                tagValue: 'deal',
            }
        ];

        let processedData = [];
        let prevStageValue;

        stages.forEach(stage => {
            let stageValue = data[stage.tagValue];

            if (stageValue) {
                //保留原始值，用于在图表上显示
                const showValue = stage.tagName + '\n\n' + stageValue;

                //转化率
                let convertRate = '';
                let convertTitle = '';

                if (stage.tagValue === 'pass') {
                    convertRate = data['pass_rate'];
                    convertTitle = '通过率';
                } else if (stage.tagValue === 'deal') {
                    convertRate = data['deal_rate'];
                    convertTitle = '成交率';
                }

                if (convertRate) {
                    convertRate = convertTitle + ': ' + (convertRate * 100).toFixed(2) + '%';
                }

                processedData.push({
                    name: convertRate,
                    value: stageValue,
                    showValue,
                });
            }
        });

        return processedData;
    }
}
