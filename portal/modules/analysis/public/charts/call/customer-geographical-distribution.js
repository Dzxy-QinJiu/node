/**
 * 客户的地域分布
 */

export function getCallCustomerGeographicalDistributionChart() {
    return {
        title: '客户的地域分布',
        chartType: 'map',
        height: 600,
        url: '/rest/callrecord/v2/callrecord/query/:data_type/call_record/region/stage/statistic',
        argCallback: arg => {
            let query = arg.query;

            if (query) {
                query.filter_phone = false,
                query.effective_phone = false,
                query.device_type = 'all';
            }
        },
        dataField: 'sum',
        processData: data => {
            let processedData = _.map(data, item => {
                return {
                    name: item.name,
                    value: parseInt(item.count),
                };
            });

            return processedData;
        },
        events: [{
            name: 'click',
            func: () => {}
        }]
    };
}
