/**
 * 客服电话统计
 */

export function getCallServiceTelChart() {
    return {
        title: '客服电话统计',
        chartType: 'bar',
        url: '/rest/analysis/callrecord/v1/callrecord/term/invailid',
        conditions: [{
            name: 'filter_phone',
            value: true
        }, {
            name: 'filter_invalid_phone',
            value: false 
        }],
        processData: (data) => {
            return _.map(data, item => {
                return {
                    name: item.sales_team,
                    value: item.invalid_docs
                };
            });
        },
    };
}
