/**
 * 签约客户行政级别市场占有率分析
 */

export function getSignedCustomerAdministrativeLevelCoverageChart() {
    return {
        title: '签约客户行政级别市场占有率分析',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/share/level',
        processData: data => [data],
        option: {
            columns: [{
                title: '省级客户数',
                dataIndex: 'province_customer',
                width: '15%',
            }, {
                title: '省级占有率',
                dataIndex: 'province_percent',
                width: '15%',
            }, {
                title: '市级客户数',
                dataIndex: 'city_customer',
                width: '15%',
            }, {
                title: '市级占有率',
                dataIndex: 'city_percent',
                width: '15%',
            }, {
                title: '县级客户数',
                dataIndex: 'county_customer',
                width: '15%',
            }, {
                title: '县级占有率',
                dataIndex: 'county_percent',
                width: '15%',
            }],
        },
    };
}
