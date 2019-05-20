/**
 * 通话总次数TOP10
 */

import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';

export function getTotalNumberTop10Chart() {
    return {
        title: Intl.get('call.analysis.total.count', '通话总次数') + 'TOP10',
        chartType: 'table',
        url: '/rest/callrecord/v2/callrecord/query/:auth_type/call_record/top',
        argCallback: arg => {
            let query = arg.query;

            if (query) {
                query.filter_phone = false,
                query.effective_phone = true,
                query.device_type = 'all';
            }
        },
        processData: (data) => {
            return _.get(data, 'list.count', []);
        },
        option: {
            columns: [
                {
                    title: Intl.get('common.phone', '电话'),
                    dataIndex: 'dst',
                    width: '120',
                    align: 'right'
                }, {
                    title: Intl.get('call.analysis.total.count', '通话总次数'),
                    dataIndex: 'count',
                    width: '100',
                    align: 'right',
                }, {
                    title: Intl.get('call.record.customer', '客户'),
                    dataIndex: 'customer_name',
                    width: '250',
                }, {
                    title: Intl.get('call.record.caller', '呼叫者'),
                    dataIndex: 'nick_name',
                    width: '70',
                }
            ]
        }
    };
}
