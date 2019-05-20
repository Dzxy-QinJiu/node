/**
 * 114占比统计
 */

export function getCall114RatioChart() {
    return {
        title: '114占比统计',
        chartType: 'bar',
        url: '/rest/callrecord/v2/callrecord/term/:start_time/:end_time',
        reqType: 'post',
        argCallback: arg => {
            let query = arg.query;
            let params = arg.params;

            if (query && params) {
                query.filter_phone = false,
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
                    value: item.rate
                };
            });
        },
    };
}
