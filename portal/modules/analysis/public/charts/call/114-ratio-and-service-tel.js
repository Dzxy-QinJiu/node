/**
 * 114占比统计和客服电话统计
 */

import { isCommonSales, numToPercent } from '../../utils';

export function getCall114RatioAndServiceTelChart(paramObj = {}) {
    let chart = {
        title: paramObj.title,
        chartType: isCommonSales() ? 'pie' : 'bar',
        url: '/rest/analysis/callrecord/v1/callrecord/term/invailid',
        conditions: [{
            name: 'filter_phone',
            value: paramObj.type === '114' ? false : true
        }, {
            name: 'filter_invalid_phone',
            value: paramObj.type === '114' ? true : false
        }],
        processData: (data, chart) => {
            let processedData = [];

            if (isCommonSales()) {
                data = data[0];

                if (data.rate !== 0) {
                    processedData.push(
                        {
                            name: Intl.get('common.114.phone', '114电话'),
                            value: data.invalid_docs,
                            rate: data.rate
                        },
                        {
                            name: Intl.get('common.non.114.phone', '非114电话'),
                            value: data.total_docs - data.invalid_docs,
                            rate: 1 - data.rate
                        }
                    );
                }
            } else {
                _.each(data, item => {
                    if (item.rate !== 0) {
                        processedData.push({
                            name: item.sales_team || item.nick_name,
                            value: item.rate
                        });
                    }
                });
            }

            return processedData;
        },
        processOption: option => {
            if (isCommonSales()) {
                option.tooltip.formatter = params => {
                    return params.marker + params.name + ': ' + params.value + ', 占比: ' + numToPercent(params.data.rate);
                };
            }

            //纵轴标签显示到100%
            option.yAxis[0].max = 1;
        }
    };

    if (!isCommonSales()) {
        chart.customOption = {
            showValueAsPercent: true,
            showYaxisLabelAsPercent: true
        };
    }

    return chart;
}
