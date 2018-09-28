/**
 * 近3个月回款周趋势图
 */

export function getRepayTrendChart() {
    return {
        title: Intl.get('contract.146', '近3个月回款周趋势图'),
        url: '/rest/analysis/contract/contract/repay/trend',
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
