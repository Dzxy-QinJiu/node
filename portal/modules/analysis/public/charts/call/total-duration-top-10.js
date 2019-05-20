/**
 * 通话总时长TOP10
 */

import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';

export function getTotalDurationTop10Chart() {
    return {
        title: Intl.get('call.analysis.total.time', '通话总时长') + 'TOP10',
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
            return _.get(data, 'list.sum', []);
        },
        option: {
            columns: [
                {
                    title: Intl.get('common.phone', '电话'),
                    dataIndex: 'dst',
                    width: '120',
                    align: 'right'
                }, {
                    title: Intl.get('call.analysis.total.time', '通话总时长'),
                    dataIndex: 'sum',
                    width: '100',
                    align: 'right',
                    render: function(data) {
                        return TimeUtil.getFormatTime(data);
                    }
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
