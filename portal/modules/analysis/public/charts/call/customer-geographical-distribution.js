/**
 * 客户的地域分布
 */

export function getCallCustomerGeographicalDistributionChart() {
    return {
        title: '客户的地域分布',
        chartType: 'map',
        height: 600,
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/distribution/region',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: false, 
        }, {
            name: 'device_type',
            value: 'all'
        }],
        dataField: 'sum',
        events: [{
            name: 'click',
            func: () => {}
        }]
    };
}
