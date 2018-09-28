/**
 * 近3个月费用周趋势图
 */

export function getCostTrendChart() {
    return {
        title: Intl.get('contract.150', '近3个月费用周趋势图'),
        url: '/rest/analysis/contract/contract/cost/trend',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                query.starttime = moment().subtract(3, 'month').valueOf();
                query.endtime = moment().valueOf();
                delete query.app_id;
            }
        },
        chartType: 'line',
    };
}
