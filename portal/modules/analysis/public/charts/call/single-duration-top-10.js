/**
 * 单次通话时长TOP10
 */

import {authType} from '../../consts';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';

export function getSingleDurationTop10Chart() {
    //所有的，包括不在团队里的数据
    let url = '/rest/callrecord/v2/callrecord/query/manager/trace/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order';

    if (authType !== 'manager') {
        url = url.replace('/manager/', '/');
    }

    return {
        title: Intl.get('sales.home.call.top.ten', '单次通话时长') + 'TOP10',
        chartType: 'table',
        url,
        reqType: 'post',
        conditions: [{
            name: 'page_size',
            value: 10,
            type: 'params'
        }, {
            name: 'sort_field',
            value: 'billsec',
            type: 'params'
        }, {
            name: 'sort_order',
            value: 'descend',
            type: 'params'
        }],
        argCallback: arg => {
            let query = arg.query;
            let params = arg.params;

            if (query && params) {
                params.start_time = query.start_time;
                params.end_time = query.end_time;
                delete query.start_time;
                delete query.end_time;
            }
        },
        processData: (data) => {
            return _.get(data, 'result', []);
        },
        option: {
            columns: [
                {
                    title: Intl.get('common.phone', '电话'),
                    dataIndex: 'dst',
                    width: '120',
                    align: 'right'
                }, {
                    title: Intl.get('sales.home.call.top.ten', '单次通话时长'),
                    dataIndex: 'billsec',
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
