/**
 * 成交周期分析
 */

export function getContractCycleChart() {
    return {
        title: '成交周期分析',
        chartType: 'bar',
        url: '/rest/analysis/contract/contract/:data_type/distribution/amount',
        reqType: 'post',
        conditions: [{
            value: getCycleReqData(),
            type: 'data',
        }],
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
                
                if (query.team_ids) {
                    query.team_id = query.team_ids;
                    delete query.team_ids;
                }
            }
        },
        processData: data => {
            return _.map(data, dataItem => {
                let name;

                if (dataItem.to === 0.5) {
                    name = '6个月内';
                } else if (dataItem.to === 1) {
                    name = '6-12个月';
                } else if (dataItem.from >= 1 && dataItem.to) {
                    name = dataItem.from + '-' + dataItem.to + '年';
                } else if (dataItem.from && !dataItem.to) {
                    name = dataItem.from + '年以上';
                } else {
                    name = '';
                }

                const value = dataItem.percent;

                return {
                    name,
                    value
                };
            });
        },
    };
}

function getCycleReqData() {
    let cycles = [];

    const spec = 2;
    const step = 0.5;

    for (let i = 0; i <= spec; i += step) {
        cycles.push({
            from: i,
            to: (i + step) <= spec ? (i + step) : 0,
        });
    }

    return cycles;
}
