/**
 * 数量与时长统计
 */

import callChart from '../../charts/call';
import Store from '../../store';
import {CALL_MENUS} from '../../consts';

module.exports = {
    title: CALL_MENUS.NUMBER_DURATION.name,
    key: CALL_MENUS.NUMBER_DURATION.key,
    menuIndex: 1,
    privileges: [
        'CUSTOMER_CALLRECORD_STATISTIC_USER',
        'CUSTOMER_CALLRECORD_STATISTIC_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [
        //近一个月的通话数量/时长趋势图
        callChart.getCallNumberTimeTrendChart({Store}),
        //通话记录统计
        callChart.getCallRecordChart({Store}),
        //通话总次数TOP10
        callChart.getTotalNumberTop10Chart(),
        //通话总时长TOP10
        callChart.getTotalDurationTop10Chart(),
        //单次通话时长TOP10
        callChart.getSingleDurationTop10Chart(),
    ];
}
