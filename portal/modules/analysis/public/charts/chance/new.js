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

    chart.processOption = option => {
        //不可见系列，用于在侧面显示转化率
        let invisibleSerie = option.series[0];
        //通过透明度设置实现不可见系列的隐藏效果
        invisibleSerie.itemStyle.normal.opacity = 0;

        //可见系列，用于渲染实际的漏斗图
        let visibleSerie = option.series[1];

        //漏斗层数
        const layerNum = invisibleSerie.data.length;

        //不可见系列相对于可见系列的纵向偏移距离百分比数值
        //该数值为每层所占的百分比的1/2再减去2
        //减2是为了让百分比标签的中间和层次分隔线对齐
        const offsetV = (100 / layerNum / 2) - 2;

        //通过设置负的的顶边距，将不可见系列顶部向上提升，以使转化率显示到两个层级之间
        invisibleSerie.top = -offsetV + '%';
        //底部需要同时提升，以实现整体提升的效果
        invisibleSerie.bottom = offsetV + '%';

        //设置不可见系列的右边距
        invisibleSerie.right = '25%';
        //设置可见系列的右边距，可见系列的右边距比不可见系列的右边距要大一些，是为了留出显示转化率的空间
        visibleSerie.right = '40%';

        //将可见系列的底边距设置为0，以覆盖默认底边距，使可见系列的底部能与不可见系列的底部错开，这样最下面的一个百分比才能正确定位
        visibleSerie.bottom = 0;

        const dealRate = _.last(visibleSerie.data).dealRate;

        option.series.push(
            {
                type: 'funnel',
                markLine: {
                    symbol: 'none',
                    lineStyle: {
                        color: '#999',
                    },
                    data: [
                        [
                            {
                                x: '60%',
                                y: 10
                            },
                            {
                                x: '95%',
                                y: 10
                            }
                        ],
                        [
                            {
                                x: '30%',
                                y: '100%'
                            },
                            {
                                x: '95%',
                                y: '100%'
                            }
                        ],
                    ]
                }
            },
            {
                type: 'funnel',
                markLine: {
                    symbol: ['none', 'arrow'],
                    lineStyle: {
                        color: '#999',
                    },
                    label: {
                        formatter: params => {
                            if (params.dataIndex === 0) {
                                return '\n成交率: ' + dealRate;
                            }
                        }
                    },
                    data: [
                        [
                            {
                                x: '90%',
                                y: 10
                            },
                            {
                                x: '90%',
                                y: '40%'
                            }
                        ],
                        [
                            {
                                x: '90%',
                                y: '100%'
                            },
                            {
                                x: '90%',
                                y: '60%'
                            }
                        ]
                    ]
                }
            }
        );
    };

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

            if (_.isNumber(stageValue)) {
                //保留原始值，用于在图表上显示
                const showValue = stage.tagName + '\n\n' + stageValue;

                //转化率
                let convertRate = '';

                if (stage.tagValue === 'pass') {
                    convertRate = data['pass_rate'];
                } else if (stage.tagValue === 'deal') {
                    convertRate = data['deal_rate'];
                }

                if (_.isNumber(convertRate)) {
                    convertRate = (convertRate * 100).toFixed(2) + '%';
                }

                processedData.push({
                    name: convertRate,
                    value: stageValue,
                    showValue,
                });
            }
        });

        //成交率
        let dealRate = ((data.deal / data.total) * 100).toFixed(2) + '%';

        _.last(processedData).dealRate = dealRate;

        return processedData;
    }
}
