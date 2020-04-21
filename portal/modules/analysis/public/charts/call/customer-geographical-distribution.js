/**
 * 客户的地域分布
 */

export function getCallCustomerGeographicalDistributionChart() {
    return {
        title: '客户的地域分布',
        chartType: 'map',
        height: 600,
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/bakup/data/distribution/region',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: false, 
        }],
        dataField: 'sum',
        events: [{
            name: 'click',
        }],
        subRegionField: 'sub_region',
        processSubRegionData: data => {
            _.each(data, item => item.value = item.count);
        },
        processCsvData: (chart, option) => {
            let csvData = [];

            let thead = [];

            let tr = [];

            _.each(option.series[0].data, item => {
                thead.push(item.name);
                tr.push(item.value);
            });

            csvData.push(thead, tr);

            return csvData;
        }
    };
}
