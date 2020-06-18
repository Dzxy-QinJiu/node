/**
 * 签约客户地域市场占有率分析
 */

//判断是否在蚁坊域的方法
const isOrganizationEefung = require('PUB_DIR/sources/utils/common-method-util').isOrganizationEefung;

export function getSignedCustomerZoneCoverageChart(paramObj = {}) {
    let columnWidth = 90;
    return {
        title: Intl.get('analysis.analysis.of.regional.market.share.of.contracted.customers', '签约客户地域市场占有率分析'),
        noShowCondition: {
            //在户登录的不是蚁坊域时不显示
            callback: () => !isOrganizationEefung()
        },
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/share/region',
        argCallback: paramObj.argCallback,
        option: {
            columns: [{
                title: Intl.get('common.definition', '名称'),
                dataIndex: 'name',
                width: 60,
            }, {
                title: Intl.get('analysis.number.of.provincial.customers', '省级客户数'),
                dataIndex: 'province_customer',
                align: 'right',
                width: columnWidth,
            }, {
                title: Intl.get('analysis.provincial.share', '省级占有率'),
                dataIndex: 'province_percent',
                showAsPercent: true,
                align: 'right',
                width: columnWidth,
            }, {
                title: Intl.get('analysis.number.of.municipal.customers', '市级客户数'),
                dataIndex: 'city_customer',
                width: columnWidth,
            }, {
                title: Intl.get('analysis.city.share', '市级占有率'),
                dataIndex: 'city_percent',
                showAsPercent: true,
                align: 'right',
                width: columnWidth,
            }, {
                title: Intl.get('analysis.number.of.county.customers', '县级客户数'),
                dataIndex: 'county_customer',
                align: 'right',
                width: columnWidth,
            }, {
                title: Intl.get('analysis.county.occupancy', '县级占有率'),
                dataIndex: 'county_percent',
                showAsPercent: true,
                align: 'right',
                width: 100,
            }],
        },
    };
}
