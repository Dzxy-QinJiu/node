/**
 * 114占比统计
 */

export function getCall114RatioChart() {
    return {
        title: '114占比统计',
        chartType: 'bar',
        customOption: {
            showValueAsPercent: true,
            showYaxisLabelAsPercent: true
        },
        url: '/rest/analysis/callrecord/v1/callrecord/term/invailid',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: true, 
        }],
        processData: (data) => {
            let processedData = [];

            _.each(data, item => {
                if (item.rate !== 0) {
                    processedData.push({
                        name: item.sales_team || item.nick_name,
                        value: item.rate
                    });
                }
            });

            return processedData;
        },
    };
}
