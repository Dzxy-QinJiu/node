/**
 * 114占比统计
 */

import { isCommonSales, numToPercent } from '../../utils';

export function getCall114RatioChart() {
    let chart = {
        title: '114占比统计',
        chartType: isCommonSales() ? 'pie' : 'bar',
        url: '/rest/analysis/callrecord/v1/callrecord/term/invailid',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: true, 
        }],
        processData: (data, chart) => {
            let processedData = [];

            if (isCommonSales()) {
                data = data[0];

                if (data.rate !== 0 || 1) {
                    processedData.push(
                        {
                            name: '114电话',
                            value: 2,
                            rate: data.rate
                        },
                        {
                            name: '非114电话',
                            value: 3,
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
