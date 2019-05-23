/**
 * 114占比统计
 */

export function getCall114RatioChart() {
    return {
        title: '114占比统计',
        chartType: 'bar',
        url: '/rest/analysis/callrecord/v1/callrecord/term/invailid',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: true, 
        }],
        processData: (data) => {
            return _.map(data, item => {
                return {
                    name: item.sales_team,
                    value: item.rate
                };
            });
        },
    };
}
