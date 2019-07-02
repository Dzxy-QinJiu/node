/**
 * 其他
 */

import customerChart from '../../charts/customer';
import {CUSTOMER_MENUS} from '../../consts';

module.exports = {
    title: CUSTOMER_MENUS.OTHER.name,
    key: CUSTOMER_MENUS.OTHER.key,
    menuIndex: 7,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        customerChart.getCustomerDealChart(),
    ];
}
