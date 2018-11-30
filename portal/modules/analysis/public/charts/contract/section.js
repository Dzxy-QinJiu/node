/**
 * 合同额分段统计
 */

export function getContractSectionChart() {
    return {
        title: '合同额分段统计',
        chartType: 'bar',
        url: '/rest/analysis/contract/contract/:data_type/distribution/amount',
        reqType: 'post',
        conditions: [{
            value: getSectionReqData(),
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

                if (dataItem.from && dataItem.to) {
                    name = (dataItem.from / 10000) + '-' + (dataItem.to / 10000) + '万';
                } else if (!dataItem.from && dataItem.to) {
                    name = (dataItem.to / 10000) + '万以下';
                } else if (dataItem.from && !dataItem.to) {
                    name = (dataItem.from / 10000) + '万以上';
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
        customOption: {
            reverse: true,
        },
    };
}

function getSectionReqData() {
    let sections = [];

    const spec = 100;
    const step = 5;

    for (let i = 0; i <= spec; i += step) {
        sections.push({
            from: i * 10000,
            to: (i + step) <= spec ? (i + step) * 10000 : 0,
        });
    }

    return sections;
}
