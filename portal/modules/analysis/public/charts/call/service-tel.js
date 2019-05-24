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
        processData: data => {
            let processedData = [];

            _.each(data, item => {
                if (item.rate !== 0) {
                    processedData.push({
                        name: item.sales_team || item.nick_name,
                        value: item.invalid_docs
                    });
                }
            });

            return processedData;
        }
    };
}
