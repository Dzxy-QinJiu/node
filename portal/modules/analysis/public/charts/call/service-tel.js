/**
 * 客服电话统计
 */

import Store from '../../store';

export function getCallServiceTelChart() {
    let url = '/rest/callrecord/v2/callrecord/term/:start_time/:end_time';

    if (Store.teamMemberFilterType === 'member') {
        url = url.replace('term', 'term/user');
    }

    return {
        title: '客服电话统计',
        chartType: 'bar',
        url,
        reqType: 'post',
        argCallback: arg => {
            let query = arg.query;
            let params = arg.params;

            if (query && params) {
                query.filter_invalid_phone = false,
                params.start_time = query.start_time;
                params.end_time = query.end_time;
                delete query.start_time;
                delete query.end_time;
            }
        },
        processData: (data) => {
            const list = _.get(data, 'list');

            return _.map(list, item => {
                return {
                    name: item.sales_team,
                    value: item.invalid_docs
                };
            });
        },
    };
}
