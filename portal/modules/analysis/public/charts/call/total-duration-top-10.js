/**
 * 通话总时长TOP10
 */

import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';

export function getTotalDurationTop10Chart() {
    return {
        title: Intl.get('call.analysis.total.time', '通话总时长') + 'TOP10',
        chartType: 'table',
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/top/sum/count',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: true, 
        }, {
            name: 'top_size',
            value: 10
        }, {
            name: 'top_type',
            value: 'sum'
        }],
        dataField: 'list',
        option: {
            columns: [
                {
                    title: Intl.get('common.phone', '电话'),
                    dataIndex: 'dst',
                    width: 120,
                }, {
                    title: Intl.get('call.analysis.total.time', '通话总时长'),
                    dataIndex: 'sum',
                    width: 100,
                    align: 'right',
                    render: function(data) {
                        return TimeUtil.getFormatTime(data);
                    }
                }, {
                    title: Intl.get('call.record.customer', '客户'),
                    dataIndex: 'customer_name',
                    isSetCsvValueBlank: true,
                    width: 250,
                }, {
                    title: Intl.get('call.record.caller', '呼叫者'),
                    dataIndex: 'nick_name',
                    isSetCsvValueBlank: true,
                    width: 70,
                }
            ]
        }
    };
}
