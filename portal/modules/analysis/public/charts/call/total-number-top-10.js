/**
 * 通话总次数TOP10
 */

import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';

export function getTotalNumberTop10Chart() {
    return {
        title: Intl.get('call.analysis.total.count', '通话总次数') + 'TOP10',
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
            value: 'count'
        }],
        dataField: 'list',
        option: {
            columns: [
                {
                    title: Intl.get('common.phone', '电话'),
                    dataIndex: 'dst',
                    width: 120,
                }, {
                    title: Intl.get('call.analysis.total.count', '通话总次数'),
                    dataIndex: 'count',
                    width: 100,
                    align: 'right',
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
